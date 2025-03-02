const express = require("express");
const app = express();

app.use(express.json());

const lobbies = [];

// api router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// add the list of game lobby IDs
apiRouter.get("/lobbies", (req, res) => {
    let jsonstuff = JSON.stringify(lobbies);
    res.status(200).json({lobbies: lobbies});
});

// add a new room, but this should definitely be implemented here and not in front end
apiRouter.post("/lobbies", (req, res) => {
    let randomID = Math.round(Math.random() * 100000);
    lobbies.push(randomID);
    res.status(200).json({lobbyID: randomID});
});

apiRouter.use("*", (req, res) => {
    console.log(req.originalUrl);
    res.send("What the heck just happened?");
});

app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

app.listen(3000);