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

///////////// Authentication stuff ///////////////

// endpoint for creating a new user
apiRouter.post("/auth", async (req, res) => {
    if (await getUser('username', req.body.username)) {
        res.send(409, {msg: "User already exists"});
    }
    else {
        const user = await createUser(req.body.username, req.body.password);
        setAuthCookie(res, user);
        DB.addUser(user);
        res.json({username: req.body.username});
    }
});

// login an existing user
apiRouter.put("/auth", async (req, res) => {
    const user = await getUser('username', req.body.username);
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
        setAuthCookie(res, user);
        // login user in the database
        DB.updateUser(user);
        res.json({username: req.body.username});
    }
    else {
        res.send(401, {msg: 'Unauthorized'});
    }
});

// logout a user
apiRouter.delete("/auth", async (req, res) => {
    const token = req.cookies['token'];
    const user = await getUser('token', token);
    if(user) {
        clearAuthCookie(res, user);
        // if there is a user in a game, we want to get rid of the game
        const lobbyInfo = checkUserInLobby(user.username);
        if (lobbyInfo) {
            delete lobbies[lobbyInfo.key];
        }
        // log the user out
        await DB.updateUser(user);
    }
    res.json({msg: 'Logged out'});
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
    res.cookie('token', user.token, { secure: true, httpOnly: true, sameSite: 'strict'});
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
        res.status(401).send({msg: "Unauthorized"});
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
        res.json({found: false});
    }
});

// check if a user is in a lobby and return it's info
function checkUserInLobby(username) {
    let correctKey = null;
    let keys = Object.keys(lobbies);
    keys.forEach(key => {
        lobbies[key].players.forEach((player, index) => {
            if(player.name == username) {
                correctKey = {key: key, playerIndex: index};
            }
        })
    });
    return correctKey;
}

// add the list of game lobby IDs
apiRouter.get("/lobbies", verifyUser, (req, res) => {
    // send a partial object to avoid giving user's secret info
    const lobbiesToSend = {}
    let keys = Object.keys(lobbies);
    keys.forEach(key => {
        if(!lobbies[key].inGame && lobbies[key].players.length < 4) {
            lobbiesToSend[key] = {
                lobbyName: lobbies[key].lobbyName
            }
        }
    });
    res.status(200).json({lobbies: lobbiesToSend});
});

// add a new lobby
apiRouter.post("/lobbies", verifyUser, async (req, res) => {
    let randomID = Math.round(Math.random() * 100000);
    let user = await getUser('token', req.cookies.token);
    let newLobby = {
        lobbyName: user.username + "'s Game",
        players: [new ServerPlayer(user.username, 7, 0, 0)],
        inGame: false,
        turn: 0,
        winner: -1,
        chatlog: [{
            type: "line",
            message: "Welcome to Medical Murder Mystery!",
        }]
    };
    lobbies[randomID] = newLobby;
    res.status(200).json({lobbyID: randomID});
});

// get the list of players in a lobby
apiRouter.get('/lobby/players/:lobbyID', verifyUser, (req, res) => {
    let currentLobby = lobbies[req.params.lobbyID];
    // include if the game has started to it begins for all users
    res.json({players: currentLobby.players, start: currentLobby.inGame});
});

// let a user join an open game
apiRouter.put('/lobby/players/:lobbyID', verifyUser, async (req, res) => {
    let user = await getUser('token', req.cookies.token);
    if (lobbies[req.params.lobbyID].players.length >= 4) {
        res.sendStatus(405);
        return;
    }
    lobbies[req.params.lobbyID].players.push(new ServerPlayer(user.username, 0, 0, lobbies[req.params.lobbyID].players.length));
    res.json({msg: 'Success'});
});

// endpoint to set the game to active
apiRouter.put('/lobby/activate/:lobbyID', verifyUser, async (req, res) => {
    lobbies[req.params.lobbyID].inGame = true;
    // generate the solution to the murder
    const players = lobbies[req.params.lobbyID].players;
    const rooms = Object.keys(gameData.roomIdNames);
    const weapons = Object.keys(gameData.weaponIdNames);
    // set the solution of the game
    lobbies[req.params.lobbyID].solution = {
        player: players[Math.floor(Math.random() * players.length)].name,
        room: rooms[Math.floor(Math.random() * rooms.length)],
        weapon: weapons[Math.floor(Math.random() * weapons.length)]
    }
    // set player locations
    let locOpts = [
        {x: 7, y: 0},
        {x: 16, y: 23},
        {x: 16, y: 0},
        {x: 7, y: 23}
    ];
    // loop to set
    lobbies[req.params.lobbyID].players.forEach((player, index) => {
        player.x = locOpts[index].x;
        player.y = locOpts[index].y;
    });
    console.log(lobbies[req.params.lobbyID].solution);
    res.json({players: lobbies[req.params.lobbyID].players});
});

// add a portion of the chat
apiRouter.put('/lobby/chat/:lobbyID', verifyUser, async (req, res) => {
    lobbies[req.params.lobbyID].chatlog.unshift(req.body);
    res.send(req.body);
});

// update a player's position
apiRouter.put('/player/position/:lobbyID', verifyUser, async (req, res) => {
    // if the lobby does not exists, a player probably left, and the game should end
    if (!(req.params.lobbyID in lobbies)) {
        res.redirect(req.get('referer'));
        return;
    }
    lobbies[req.params.lobbyID].players[req.body.index].x = req.body.x;
    lobbies[req.params.lobbyID].players[req.body.index].y = req.body.y;
    lobbies[req.params.lobbyID].turn = req.body.turn;
    lobbies[req.params.lobbyID].players[req.body.index].moves = req.body.moves;
    lobbies[req.params.lobbyID].players[req.body.index].recentArrival = req.body.recentArrival;
    lobbies[req.params.lobbyID].players[req.body.index].currentRoom = req.body.currentRoom;
    // send the user back I guess
    res.json(lobbies[req.params.lobbyID].players[req.body.index]);
});

// make a guess for the game
apiRouter.put('/lobby/guess/:lobbyID', verifyUser, async (req, res) => {
    const guess = req.body;
    let guesser = await getUser('token', req.cookies.token);
    // get which is the guessor
    lobbies[req.params.lobbyID].players.forEach((player, index) => {
        if(player.name == guesser.username) {
            guesser = player;
        }
    });
    let correctFlags = 0; // 3 flags is a winner
    // winner will be -1 until the winner is set
    const response = {
        winner: -1,
        player: false,
        room: false,
        weapon: false
    };
    // determine player
    if (guess.player == lobbies[req.params.lobbyID].solution.player) {
        response.player = true;
        guesser.guesses[guess.player] = true;
        // add info about correct
        correctFlags++;
    }
    else {
        guesser.guesses[guess.player] = false;
    }
    // determine room
    if (guess.room == lobbies[req.params.lobbyID].solution.room) {
        response.room = true;;
        correctFlags++;
        guesser.guesses[guess.room] = true;
    }
    else {
        guesser.guesses[guess.room] = false;
    }
    // determine weapon
    if (guess.weapon == lobbies[req.params.lobbyID].solution.weapon) {
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
            delete lobbies[req.params.lobbyID];
        }, 6000);
    }
    // set the correctness of the guesses to send back
    response.results = guesser.guesses;
    lobbies[req.params.lobbyID].turn = guess.nextTurn;
    lobbies[req.params.lobbyID].winner = response.winner;
    guesser.recentArrival = false;
    // update the history based on the guess
    await updateHistory(guesser, guess.player, guess.room, guess.weapon);
    res.json(response);
});

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
    res.json({history: hist});
})


app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
    res.sendFile('index.html', {root: 'public'});
});

const server = app.listen(port, () => {
    console.log("On port " + port);
});

const socketServer = new WebSocketServer({server});
const connections = [];

// set up WebSocket connection
socketServer.on('connection', socket => {
    // create new connection for the list
    const connection = {id: uuid.v4(), alive: true, socket: socket};
    connections.push(connection);

    socket.on('message', data => {
        switch (data.case) {
            // differentiate behavior based on data
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

// send out pings
setInterval(() => {
    connections.forEach(con => {
        // if client has been dormant between checks, terminate them
        if(con.alive === false) return con.socket.terminate();
        
        // set this flag between connection
        con.alive = false;

        con.socket.ping();
    });
}, 10000);