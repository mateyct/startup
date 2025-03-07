const express = require("express");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const cookieParser = require("cookie-parser");
const app = express();

const gameData = require("./datafiles/clueData.json");

app.use(express.json());
app.use(cookieParser());

const users = [];

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

        res.json({username: req.body.username});
    }
});

// login an existing user
apiRouter.put("/auth", async (req, res) => {
    const user = await getUser('username', req.body.username);
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
        setAuthCookie(res, user);
        res.json({username: req.body.username});
    }
    else {
        res.send(401, {msg: 'Unauthorized'});
    }
});

// logout a user
apiRouter.delete("/auth", async (req, res) => {
    const token = req.cookies['token'];
    const user = getUser('token', token);
    if(user) {
        clearAuthCookie(res, user);
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

    users.push(user);
    return user;
}

// check if the user exists
async function getUser(field, value) {
    if (value) {
        return users.find((user) => user[field] === value);
    }
    return null;
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
    // TODO: Make this function return the list of players too
    // get if in lobby
    const lobbyInfo = checkUserInLobby(req.cookies.token);
    // send needed lobby info if in game, if not, don't
    if (lobbyInfo) {
        res.json({found: true, lobbyID: lobbyInfo.key, inGame: lobbies[lobbyInfo.key].inGame, playerIndex: lobbyInfo.playerIndex});
    }
    else {
        res.json({found: false});
    }
});

// check if a user is in a lobby and return it's info
function checkUserInLobby(token) {
    let correctKey = null;
    let keys = Object.keys(lobbies);
    keys.forEach(key => {
        lobbies[key].players.forEach((player, index) => {
            if(player.token == token) {
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
        lobbiesToSend[key] = {
            lobbyName: lobbies[key].lobbyName
        }
    });
    res.status(200).json({lobbies: lobbiesToSend});
});

// add a new room, but this should definitely be implemented here and not in front end
apiRouter.post("/lobbies", verifyUser, async (req, res) => {
    let randomID = Math.round(Math.random() * 100000);
    let user = await getUser('token', req.cookies.token);
    let newLobby = {
        lobbyName: user.username + "'s Game",
        players: [user],
        inGame: false
    };
    lobbies[randomID] = newLobby;
    res.status(200).json({lobbyID: randomID});
});

// get the list of players in a lobby
apiRouter.get('/lobby/players/:lobbyID', verifyUser, (req, res) => {
    let currentLobby = lobbies[req.params.lobbyID];
    res.json({players: currentLobby.players});
});

// let a user join an open game
apiRouter.put('/lobby/players/:lobbyID', verifyUser, async (req, res) => {
    let user = await getUser('token', req.cookies.token);
    lobbies[req.params.lobbyID].players.push(user);
    res.status(200).json({msg: 'Success'});
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
        player: players[Math.floor(Math.random() * players.length)].username,
        room: rooms[Math.floor(Math.random() * rooms.length)],
        weapon: weapons[Math.floor(Math.random() * weapons.length)]
    }
    console.log(lobbies[req.params.lobbyID].solution);
    res.status(200).end();
});

// make a guess for the game
apiRouter.put('/lobby/guess/:lobbyID', verifyUser, async (req, res) => {
    const guess = req.body;
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
        // add info about correct
        correctFlags++;
    }
    // determine room
    if (guess.room == lobbies[req.params.lobbyID].solution.room) {
        response.room = true;;
        correctFlags++;
    }
    // determine weapon
    if (guess.weapon == lobbies[req.params.lobbyID].solution.weapon) {
        response.weapon = true;
        correctFlags++;
    }
    // check if they won
    if (correctFlags >= 3) {
        // get which is the winner
        let keys = Object.keys(lobbies);
        let token = req.cookies.token;
        keys.forEach(key => {
            lobbies[key].players.forEach((player, index) => {
                if(player.token == token) {
                    response.winner = index;
                }
            })
        });
    }
    res.json(response);
});

apiRouter.use("*", (req, res) => {
    console.log(req.originalUrl);
    res.send({msg: "What the heck just happened?"});
});

app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

app.listen(3000);