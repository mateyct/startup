const express = require("express");
const cookieParser = require("cookie-parser");
const dbHelpers = require("./helpers/dbHelpers");
const authRoutes = require("./routes/auth");
const historyRoutes = require("./routes/history");
const lobbiesRoutes = require("./routes/lobbies");
const { WebSocketServer } = require("ws");
const LobbyManager = require("./gameplay/lobbyManager");
const ConnectionManager = require("./gameplay/connectionManager");
const DB = require("./db");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// do this for the port
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// api router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

const lobbyManager = new LobbyManager();

const { verifyUser } = dbHelpers(DB);

app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

const server = app.listen(port, () => {
  console.log("On port " + port);
});

const socketServer = new WebSocketServer({ server });
const connectionManager = new ConnectionManager(lobbyManager, socketServer, DB);

apiRouter.use("/auth", authRoutes(DB, lobbyManager, connectionManager));
apiRouter.use("/history", verifyUser, historyRoutes(DB));
apiRouter.use("/lobbies", verifyUser, lobbiesRoutes(lobbyManager));
