const express = require("express");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const cookieParser = require("cookie-parser");
const app = express();

const ServerPlayer = require("./ServerPlayer");

const gameData = require("./clueData.json");

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const DB = require('./db');

const { WebSocketServer } = require('ws');

// do this for the port
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// api router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

const connections = [];

///////////// Authentication stuff ///////////////

// endpoint for creating a new user
apiRouter.post("/auth", async (req, res) => {
    if (await getUser('username', req.body.username)) {
        res.send(409, { msg: "User already exists" });
    }
    else {
        const user = await createUser(req.body.username, req.body.password);
        setAuthCookie(res, user);
        DB.addUser(user);
        res.json({ username: req.body.username });
    }
});

// login an existing user
apiRouter.put("/auth", async (req, res) => {
    const user = await getUser('username', req.body.username);
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
        setAuthCookie(res, user);
        // login user in the database
        DB.updateUser(user);
        res.json({ username: req.body.username });
    }
    else {
        res.send(401, { msg: 'Unauthorized' });
    }
});

// logout a user
apiRouter.delete("/auth", async (req, res) => {
    const token = req.cookies['token'];
    const user = await getUser('token', token);
    if (user) {
        clearAuthCookie(res, user);
        // if there is a user in a game, we want to get rid of the game
        const lobbyInfo = checkUserInLobby(user.username);
        if (lobbyInfo) {
            delete lobbies[lobbyInfo.key];
            // send messages to refresh when game is started
            connections.forEach(con => {
                con.socket.send(JSON.stringify(getLobbies()));
            });
        }
        // log the user out
        await DB.updateUser(user);
    }
    res.json({ msg: 'Logged out' });
});

// creates a new user
async function createUser(username, password) {
    // set up hashed password with user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        username: username,
        password: passwordHash
    }
    return user;
}

// check if the user exists
async function getUser(field, value) {
    if (!value) return null;
    // get user from DB
    if (field === "token") {
        return DB.getUserByToken(value);
    }

    return DB.getUser(value);
}

// sets the auth cookie
function setAuthCookie(res, user) {
    user.token = uuid.v4();
    res.cookie('token', user.token, { secure: true, httpOnly: true, sameSite: 'strict' });
}

// clears the auth cookie
function clearAuthCookie(res, user) {
    delete user.token;
    res.clearCookie('token');
}

// middleware for verifying users are signed in
const verifyUser = async (req, res, next) => {
    const user = await getUser('token', req.cookies.token);
    if (user) {
        next();
    }
    else {
        res.status(401).send({ msg: "Unauthorized" });
    }
}

//////////// Gameplay stuff ////////////////

const lobbies = {};

// Check if the user is already in a lobby/game, return its info if so
apiRouter.get('/lobby/player/status', verifyUser, async (req, res) => {
    // get if in lobby
    const user = await getUser('token', req.cookies.token);
    const lobbyInfo = checkUserInLobby(user.username);
    // send needed lobby info if in game, if not, don't
    if (lobbyInfo) {
        res.json({
            found: true,
            lobbyID: lobbyInfo.key,
            inGame: lobbies[lobbyInfo.key].inGame,
            playerIndex: lobbyInfo.playerIndex,
            players: lobbies[lobbyInfo.key].players,
            turn: lobbies[lobbyInfo.key].turn,
            winner: lobbies[lobbyInfo.key].winner,
            chatlog: lobbies[lobbyInfo.key].chatlog
        });
    }
    else {
        res.json({ found: false });
    }
});

// return the list of lobby IDs
apiRouter.get('/lobbies', verifyUser, (req, res) => {
    res.send({ lobbies: getLobbies().lobbies });
});

// check if a user is in a lobby and return it's info
function checkUserInLobby(username) {
    let correctKey = null;
    let keys = Object.keys(lobbies);
    keys.forEach(key => {
        lobbies[key].players.forEach((player, index) => {
            if (player.name == username) {
                correctKey = { key: key, playerIndex: index };
            }
        })
    });
    return correctKey;
}

// gets the list of lobbies to send out
function getLobbies() {
    const lobbiesToSend = {}
    let keys = Object.keys(lobbies);
    keys.forEach(key => {
        if (!lobbies[key].inGame && lobbies[key].players.length < 4) {
            lobbiesToSend[key] = {
                lobbyName: lobbies[key].lobbyName
            }
        }
    });
    return { case: "newLobby", lobbies: lobbiesToSend };
}

// function to make a new lobby
async function createLobby(username) {
    let randomID = Math.round(Math.random() * 100000);
    let user = await getUser('username', username);
    let newLobby = {
        lobbyName: user.username + "'s Game",
        players: [new ServerPlayer(user.username, 7, 0, 0)],
        inGame: false,
        turn: 0,
        winner: -1,
        chatlog: [{
            type: "line",
            message: "Welcome to Medical Murder Mystery!",
        }],
        connections: []
    };
    lobbies[randomID] = newLobby;
    return { lobbyID: randomID, case: "newLobby" };
}

async function joinLobby(lobbyID, username) {
    let user = await getUser('username', username);
    if (lobbies[lobbyID].players.length >= 4) {
        return {msg: "lobby full"};
    }
    lobbies[lobbyID].players.push(new ServerPlayer(username, 0, 0, lobbies[lobbyID].players.length));
}

function startGame(lobbyID) {
    lobbies[lobbyID].inGame = true;
    // generate the solution to the murder
    const players = lobbies[lobbyID].players;
    const rooms = Object.keys(gameData.roomIdNames);
    const weapons = Object.keys(gameData.weaponIdNames);
    // set the solution of the game
    lobbies[lobbyID].solution = {
        player: players[Math.floor(Math.random() * players.length)].name,
        room: rooms[Math.floor(Math.random() * rooms.length)],
        weapon: weapons[Math.floor(Math.random() * weapons.length)]
    }
    // set player locations
    let locOpts = [
        { x: 7, y: 0 },
        { x: 16, y: 23 },
        { x: 16, y: 0 },
        { x: 7, y: 23 }
    ];
    // loop to set
    lobbies[lobbyID].players.forEach((player, index) => {
        player.x = locOpts[index].x;
        player.y = locOpts[index].y;
    });
    console.log(lobbies[lobbyID].solution);
    return { players: lobbies[lobbyID].players, case: "startGame" };
}

// function to update the chat for everyone
function updateChat(data) {
    lobbies[data.lobbyID].chatlog.unshift(data.message);
    return lobbies[data.lobbyID].chatlog;
}

// update the player's position based on data
function updatePlayer(data) {
    // set all of these things
    lobbies[data.lobbyID].players[data.index].x = data.x;
    lobbies[data.lobbyID].players[data.index].y = data.y;
    lobbies[data.lobbyID].turn = data.turn;
    lobbies[data.lobbyID].players[data.index].moves = data.moves;
    lobbies[data.lobbyID].players[data.index].recentArrival = data.recentArrival;
    lobbies[data.lobbyID].players[data.index].currentRoom = data.currentRoom;
}

// function to handle guess making
async function handleGuess(guesser, guess) {
    // get which is the guessor
    lobbies[guess.lobbyID].players.forEach((player, index) => {
        if (player.name == guesser.username) {
            guesser = player;
        }
    });
    let correctFlags = 0; // 3 flags is a winner
    // winner will be -1 until the winner is set
    const response = {
        winner: -1,
        player: false,
        room: false,
        weapon: false,
        case: "guessResult"
    };
    // determine player
    if (guess.player == lobbies[guess.lobbyID].solution.player) {
        response.player = true;
        guesser.guesses[guess.player] = true;
        // add info about correct
        correctFlags++;
    }
    else {
        guesser.guesses[guess.player] = false;
    }
    // determine room
    if (guess.room == lobbies[guess.lobbyID].solution.room) {
        response.room = true;;
        correctFlags++;
        guesser.guesses[guess.room] = true;
    }
    else {
        guesser.guesses[guess.room] = false;
    }
    // determine weapon
    if (guess.weapon == lobbies[guess.lobbyID].solution.weapon) {
        response.weapon = true;
        correctFlags++;
        guesser.guesses[guess.weapon] = true;
    }
    else {
        guesser.guesses[guess.weapon] = false;
    }
    // check if they won
    if (correctFlags >= 3) {
        response.winner = guesser.index;
        // delay for a bit, then end the game
        setTimeout(() => {
            delete lobbies[guess.lobbyID];
        }, 6000);
    }
    // set the correctness of the guesses to send back
    response.results = guesser.guesses;
    lobbies[guess.lobbyID].turn = guess.nextTurn;
    lobbies[guess.lobbyID].winner = response.winner;
    guesser.recentArrival = false;
    // update the history based on the guess
    await updateHistory(guesser, guess.player, guess.room, guess.weapon);
    return response;
}

//////////// History Stuff /////////////

// add a new history entry
const updateHistory = async (guesser, person, room, weapon) => {
    // set up the object
    let histItem = {
        date: Date.now(),
        guesser: guesser.name,
        person: person,
        room: room,
        weapon: weapon
    };
    await DB.addUserHistory(histItem);

};

// retrieve history of the user
apiRouter.get('/history', verifyUser, async (req, res) => {
    const user = await getUser('token', req.cookies?.token);
    let hist = await DB.getUserHistory(user.username);
    res.json({ history: hist });
})


app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

const server = app.listen(port, () => {
    console.log("On port " + port);
});

// gets and returns player's info
function getPlayerInfo(lobbyID) {
    let data = { found: false };
    // find the lobby data
    if (lobbyID in lobbies) {
        data = {
            found: true,
            case: "updatePos",
            players: lobbies[lobbyID].players,
            turn: lobbies[lobbyID].turn,
            winner: lobbies[lobbyID].winner,
            chatlog: lobbies[lobbyID].chatlog
        }
    }
    return data;
}

const socketServer = new WebSocketServer({ server });

// set up WebSocket connection
socketServer.on('connection', (socket, req) => {
    // create new connection for the list
    const params = new URLSearchParams(req.url.split('?')[1]);
    let username = params.get('username');
    const connection = { id: uuid.v4(), alive: true, socket: socket, username };
    connections.push(connection);
    // check if the user is already in a lobby and add them
    let lobbyInfo = checkUserInLobby(username);
    if (lobbyInfo) {
        lobbies[lobbyInfo.key].connections[lobbyInfo.playerIndex] = connection;
    }
    // check for socket connections
    socket.on('message', async data => {
        // parse it into JSON
        data = JSON.parse(data);
        // declare this up here to be used later
        let players;
        // Very big, nasty, bad switch statement...
        switch (data.case) {
            case "updatePos":
                // update player info on the server
                updatePlayer(data);
                // get player info from the server and send it to each person
                players = getPlayerInfo(data.lobbyID);
                lobbies[data.lobbyID].connections.forEach((con, index) => {
                    players.playerIndex = index;
                    con.socket.send(JSON.stringify(players));
                });
                break;
            case "update":
                // get player info from the server and send it to each person
                players = getPlayerInfo(data.lobbyID);
                lobbies[data.lobbyID].connections.forEach((con, index) => {
                    players.playerIndex = index;
                    con.socket.send(JSON.stringify(players));
                });
                break;
            case "guess":
                let player = await getUser("username", data.guesser);
                const result = await handleGuess(player, data);
                players = getPlayerInfo(data.lobbyID);
                // send result back to player
                if (result.winner >= 0) {
                    lobbies[data.lobbyID].connections.forEach(con => {
                        con.socket.send(JSON.stringify(result));
                    });
                }
                else {
                    connection.socket.send(JSON.stringify(result));
                }
                // loop to update positions and such
                lobbies[data.lobbyID].connections.forEach((con, index) => {
                    players.playerIndex = index;
                    con.socket.send(JSON.stringify(players));
                });
                break;
            case "startGame":
                // send code to start the game
                let game = startGame(data.lobbyID);
                lobbies[data.lobbyID].connections.forEach((con, index) => {
                    game.playerIndex = index;
                    con.socket.send(JSON.stringify(game));
                });
                // send messages to refresh when game is started
                connections.forEach(con => {
                    con.socket.send(JSON.stringify(getLobbies()));
                });
                break;
            case "createLobby":
                // create the new lobby
                let newLobbyInfo = await createLobby(data.username);
                let lobbyInfo = getLobbies();
                connections.forEach(con => {
                    con.socket.send(JSON.stringify(lobbyInfo));
                });
                // send message to creator to join lobby
                connection.socket.send(JSON.stringify({
                    case: "creatorJoin",
                    lobbyID: newLobbyInfo.lobbyID
                }));
                // add the socket connection to the lobby
                lobbies[newLobbyInfo.lobbyID].connections.push(connection);
                // send update to people in lobby that it's been joined
                sendUpdateToPlayers(newLobbyInfo.lobbyID);
                break;
            case "chat":
                let chat = updateChat(data);
                lobbies[data.lobbyID].connections.forEach(con => {
                    con.socket.send(JSON.stringify(chat));
                });
                break;
            case "joinLobby":
                lobbies[data.lobbyID].connections.push(connection);
                await joinLobby(data.lobbyID, connection.username);
                // get the list of lobbies again to remove full lobbies from list
                let lobbiesToSend = getLobbies();
                connections.forEach(con => {
                    con.socket.send(JSON.stringify(lobbiesToSend));
                });
                // send message to joiner to join lobby
                connection.socket.send(JSON.stringify({
                    case: "creatorJoin",
                    lobbyID: data.lobbyID
                }));
                // send update to people in lobby that it's been joined
                sendUpdateToPlayers(data.lobbyID);
                break;
        }
    });

    // process a closure
    socket.on('close', () => {
        let index = connections.findIndex(co => co.id === connection.id);
        if (index >= 0) {
            connections.splice(index, 1);
        }
    });

    // receive pings and pongs to maintain connection
    socket.on('pong', () => {
        connection.alive = true;
    })
});

// sends updates to players currently waiting for a game to start
function sendUpdateToPlayers(lobbyID) {
    let toSendPlayers = {
        case: "updatePlayers",
        players: lobbies[lobbyID].players
    };
    lobbies[lobbyID].connections.forEach(con => {
        con.socket.send(JSON.stringify(toSendPlayers));
    });
}

// send out pings
setInterval(() => {
    connections.forEach(con => {
        // if client has been dormant between checks, terminate them
        if (con.alive === false) return con.socket.terminate();

        // set this flag between connection
        con.alive = false;

        con.socket.ping();
    });
}, 10000);