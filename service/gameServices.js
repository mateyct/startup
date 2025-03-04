const express = require("express");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

const lobbies = [];

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
        const user = createUser(req.body.username, req.body.password);
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