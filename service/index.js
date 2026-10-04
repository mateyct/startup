const express = require("express");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const cookieParser = require("cookie-parser");
const dbHelpers = require('./helpers/dbHelpers')
const authRoutes = require('./routes/auth')

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const DB = require('./db');

const { WebSocketServer } = require('ws');
const LobbyManager = require("./gameplay/lobbyManager");

// do this for the port
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// api router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

const lobbyManager = new LobbyManager()
const connections = [];

apiRouter.use('/auth', authRoutes(DB, lobbyManager, connections))


const { verifyUser, getUser } = dbHelpers(DB)

///////////// Authentication stuff ///////////////

// // endpoint for creating a new user
// apiRouter.post("/auth", async (req, res) => {
//     if (await getUser('username', req.body.username)) {
//         res.send(409, { msg: "User already exists" });
//     }
//     else {
//         const user = await createUser(req.body.username, req.body.password);
//         setAuthCookie(res, user);
//         DB.addUser(user);
//         res.json({ username: req.body.username });
//     }
// });

// // login an existing user
// apiRouter.put("/auth", async (req, res) => {
//     const user = await getUser('username', req.body.username);
//     if (user && (await bcrypt.compare(req.body.password, user.password))) {
//         setAuthCookie(res, user);
//         // login user in the database
//         DB.updateUser(user);
//         res.json({ username: req.body.username });
//     }
//     else {
//         res.send(401, { msg: 'Unauthorized' });
//     }
// });

// // logout a user
// apiRouter.delete("/auth", async (req, res) => {
//     const token = req.cookies['token'];
//     const user = await getUser('token', token);
//     if (user) {
//         clearAuthCookie(res, user);
//         // if there is a user in a game, we want to get rid of the game
//         const lobbyInfo = checkUserInLobby(user.username);
//         if (lobbyInfo) {
//             delete lobbies[lobbyInfo.key];
//             // send messages to refresh when game is started
//             connections.forEach(con => {
//                 con.socket.send(JSON.stringify(getLobbies()));
//             });
//         }
//         // log the user out
//         await DB.updateUser(user);
//     }
//     res.json({ msg: 'Logged out' });
// });

// // creates a new user
// async function createUser(username, password) {
//     // set up hashed password with user
//     const passwordHash = await bcrypt.hash(password, 10);
//     const user = {
//         username: username,
//         password: passwordHash
//     }
//     return user;
// }

// check if the user exists
// async function getUser(field, value) {
//     if (!value) return null;
//     // get user from DB
//     if (field === "token") {
//         return DB.getUserByToken(value);
//     }

//     return DB.getUser(value);
// }

// // sets the auth cookie
// function setAuthCookie(res, user) {
//     user.token = uuid.v4();
//     res.cookie('token', user.token, { secure: true, httpOnly: true, sameSite: 'strict' });
// }

// // clears the auth cookie
// function clearAuthCookie(res, user) {
//     delete user.token;
//     res.clearCookie('token');
// }

// middleware for verifying users are signed in
// const verifyUser = async (req, res, next) => {
//     const user = await getUser('token', req.cookies.token);
//     if (user) {
//         next();
//     }
//     else {
//         res.status(401).send({ msg: "Unauthorized" });
//     }
// }

//////////// Gameplay stuff ////////////////

// Check if the user is already in a lobby/game, return its info if so
apiRouter.get('/lobbies/player/status', verifyUser, async (req, res) => {
    // get if in lobby
    const user = await getUser('token', req.cookies.token);
    const lobbyInfo = lobbyManager.checkUserInLobby(user.username)
    // send needed lobby info if in game, if not, don't
    if (lobbyInfo) {
        const lobby = lobbyManager.getLobby(lobbyInfo.key)
        res.json({
            found: true,
            lobbyID: lobbyInfo.key,
            inGame: lobby.inGame,
            playerIndex: lobbyInfo.playerIndex,
            players: lobby.players,
            turn: lobby.turn,
            winner: lobby.winner,
            chatlog: lobby.chatlog
        });
    }
    else {
        res.json({ found: false });
    }
});

// return the list of lobby IDs
apiRouter.get('/lobbies', verifyUser, (req, res) => {
    res.send({ lobbies: lobbyManager.getOpenLobbies().lobbies });
});

// function to handle guess making
async function handleGuess(guesser, guess) {
    const response = lobbyManager.attemptGuess(guesser, guess)
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

// // gets and returns player's info
// function getGamePlayers(lobbyID) {
//     let data = { found: false };
//     // find the lobby data
//     if (lobbyID in lobbies) {
//         data = {
//             found: true,
//             case: "updatePos",
//             players: lobbies[lobbyID].players,
//             turn: lobbies[lobbyID].turn,
//             winner: lobbies[lobbyID].winner,
//             chatlog: lobbies[lobbyID].chatlog
//         }
//     }
//     return data;
// }

const socketServer = new WebSocketServer({ server });

const scopedConnections = {}

// set up WebSocket connection
socketServer.on('connection', (socket, req) => {
    // create new connection for the list
    const params = new URLSearchParams(req.url.split('?')[1]);
    let username = params.get('username');
    const connection = { id: uuid.v4(), alive: true, socket: socket, username };
    connections.push(connection);
    // check if the user is already in a lobby and add a connection
    let lobbyInfo = lobbyManager.checkUserInLobby(username);
    if (lobbyInfo) {
        scopedConnections[lobbyInfo.key][lobbyInfo.playerIndex] = connection
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
                lobbyManager.updatePlayer(data)
                // updatePlayer(data);
                // get player info from the server and send it to each person
                players = lobbyManager.getPlayers(data.lobbyID)
                // players = getGamePlayers(data.lobbyID);
                scopedConnections[data.lobbyID].forEach((con, index) => {
                    players.playerIndex = index;
                    con.socket.send(JSON.stringify(players));
                })
                break;
            case "update":
                // get player info from the server and send it to each person
                players = lobbyManager.getPlayers(data.lobbyID)
                scopedConnections[data.lobbyID].forEach((con, index) => {
                    players.playerIndex = index;
                    con.socket.send(JSON.stringify(players));
                })
                break;
            case "guess":
                let player = await getUser("username", data.guesser);
                const result = await handleGuess(player, data);
                players = lobbyManager.getPlayers(data.lobbyID)
                // send result back to player
                if (result.winner >= 0) {
                    scopedConnections[data.lobbyID].forEach((con) => {
                        con.socket.send(JSON.stringify(result));
                    })
                }
                else {
                    connection.socket.send(JSON.stringify(result));
                }
                // loop to update positions and such
                scopedConnections[data.lobbyID].forEach((con, index) => {
                    players.playerIndex = index;
                    con.socket.send(JSON.stringify(players));
                });
                break;
            case "startGame":
                // send code to start the game
                let game = lobbyManager.startGame(data.lobbyID);
                scopedConnections[data.lobbyID].forEach((con, index) => {
                    game.playerIndex = index;
                    con.socket.send(JSON.stringify(game));
                })
                // send messages to refresh when game is started
                connections.forEach(con => {
                    con.socket.send(JSON.stringify(lobbyManager.getOpenLobbies()));
                });
                break;
            case "createLobby":
                // create the new lobby
                let newLobbyInfo = lobbyManager.createLobby(data.username);
                let lobbyInfo = lobbyManager.getOpenLobbies();
                connections.forEach(con => {
                    con.socket.send(JSON.stringify(lobbyInfo));
                });
                // send message to creator to join lobby
                connection.socket.send(JSON.stringify({
                    case: "creatorJoin",
                    lobbyID: newLobbyInfo.lobbyID
                }));
                // add the socket connection to the lobby
                scopedConnections[newLobbyInfo.lobbyID] = [connection]
                // send update to people in lobby that it's been joined
                sendUpdateToPlayers(newLobbyInfo.lobbyID);
                break;
            case "chat":
                let chat = lobbyManager.updateChat(data);
                // let chat = updateChat(data);
                scopedConnections[data.lobbyID].forEach((con) => {
                    con.socket.send(JSON.stringify(chat));
                })
                break;
            case "joinLobby":
                scopedConnections[data.lobbyID].push(connection)
                lobbyManager.joinLobby(data.lobbyID, connection.username);
                // await joinLobby(data.lobbyID, connection.username);
                // get the list of lobbies again to remove full lobbies from list
                let lobbiesToSend = lobbyManager.getOpenLobbies();
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
        players: lobbyManager.getPlayers(lobbyID).players
    };
    scopedConnections[lobbyID].forEach(con => {
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