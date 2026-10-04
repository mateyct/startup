const express = require("express");
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
const ConnectionManager = require("./gameplay/connectionManager");

// do this for the port
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// api router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

const lobbyManager = new LobbyManager()

const { verifyUser, getUser } = dbHelpers(DB)

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

//////////// History Stuff /////////////


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




const socketServer = new WebSocketServer({ server });
const connectionManager = new ConnectionManager(lobbyManager, socketServer, DB)

apiRouter.use('/auth', authRoutes(DB, lobbyManager, connectionManager))
