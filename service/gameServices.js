const express = require("express");
const app = express();

app.use(express.json());

let lobbies = [27543];

// api router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// add the list of game lobby IDs
apiRouter.get("/lobbies", (req, res) => {
    console.log(req.originalUrl);
    let jsonstuff = JSON.stringify(lobbies);
    console.log(jsonstuff);
    res.status(200).json({lobbies: lobbies});
});

// add an ID to the lobby
apiRouter.post("/lobbies", (req, res) => {
    let data = req.body;
    lobbies.push(data);
    res.sendStatus(200);
});

apiRouter.use("*", (req, res) => {
    console.log(req.originalUrl);
    res.send("What the heck just happened?");
});

app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

app.listen(3000);