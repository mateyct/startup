const express = require("express");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

const lobbies = [];

const passwords = {};

// api router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

///////////// Authentication stuff ///////////////

// register a new user
apiRouter.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const token = uuid.v4();
    res.cookie('token', token, { secure: true, httpOnly: true, sameSite: 'strict'});
    passwords[req.body.user] = hashedPassword;
    res.json({user: req.body.user});
});

// login an existing user
apiRouter.put("/login", async (req, res) => {
    const hashedPassword = passwords[req.body.user]
    if (hashedPassword && (await bcrypt.compare(req.body.password, hashedPassword))) {
        res.cookie('token', token, { secure: true, httpOnly: true, sameSite: 'strict'});
        res.json({user: req.body.user});
    }
    else {
        res.send(401, {msg: 'Invalid user or password'});
    }
});

//////////// Gameplay stuff ////////////////

// add the list of game lobby IDs
apiRouter.get("/lobbies", (req, res) => {
    res.status(200).json({lobbies: lobbies});
});

// add a new room, but this should definitely be implemented here and not in front end
apiRouter.post("/lobbies", (req, res) => {
    let randomID = Math.round(Math.random() * 100000);
    let newLobby = {
        lobbyID: randomID,
        players: []
    };
    lobbies.push(newLobby);
    res.status(200).json(newLobby);
});

apiRouter.use("*", (req, res) => {
    console.log(req.originalUrl);
    res.send("What the heck just happened?");
});

app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

app.listen(3000);