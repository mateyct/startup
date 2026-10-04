const uuid = require("uuid");
const dbHelpers = require("../helpers/dbHelpers");

module.exports = class ConnectionManager {
  constructor(lobbyManager, socketServer, DB) {
    this.connections = [];
    this.scopedConnections = {};
    this.lobbyManager = lobbyManager;
    this.DB = DB;
    this.setupWSHandlers(socketServer);
  }

  setupWSHandlers(socketServer) {
    const { getUser } = dbHelpers(this.DB);
    // set up WebSocket connection
    socketServer.on("connection", (socket, req) => {
      // create new connection for the list
      const params = new URLSearchParams(req.url.split("?")[1]);
      let username = params.get("username");
      const connection = {
        id: uuid.v4(),
        alive: true,
        socket: socket,
        username,
      };
      this.connections.push(connection);
      // check if the user is already in a lobby and add a connection
      let lobbyInfo = this.lobbyManager.checkUserInLobby(username);
      if (lobbyInfo) {
        this.scopedConnections[lobbyInfo.key][lobbyInfo.playerIndex] =
          connection;
      }
      // check for socket connections
      socket.on("message", async (data) => {
        // parse it into JSON
        data = JSON.parse(data);
        // declare this up here to be used later
        let players;
        // Very big, nasty, bad switch statement...
        switch (data.case) {
          case "updatePos":
            // update player info on the server
            this.lobbyManager.updatePlayer(data);
            // updatePlayer(data);
            // get player info from the server and send it to each person
            players = this.lobbyManager.getPlayers(data.lobbyID);
            // players = getGamePlayers(data.lobbyID);
            this.scopedConnections[data.lobbyID].forEach((con, index) => {
              players.playerIndex = index;
              con.socket.send(JSON.stringify(players));
            });
            break;
          case "update":
            // get player info from the server and send it to each person
            players = this.lobbyManager.getPlayers(data.lobbyID);
            this.scopedConnections[data.lobbyID].forEach((con, index) => {
              players.playerIndex = index;
              con.socket.send(JSON.stringify(players));
            });
            break;
          case "guess":
            let player = await getUser("username", data.guesser);
            const result = await this.handleGuess(player, data);
            players = this.lobbyManager.getPlayers(data.lobbyID);
            // send result back to player
            if (result.winner >= 0) {
              this.scopedConnections[data.lobbyID].forEach((con) => {
                con.socket.send(JSON.stringify(result));
              });
            } else {
              connection.socket.send(JSON.stringify(result));
            }
            // loop to update positions and such
            this.scopedConnections[data.lobbyID].forEach((con, index) => {
              players.playerIndex = index;
              con.socket.send(JSON.stringify(players));
            });
            break;
          case "startGame":
            // send code to start the game
            let game = this.lobbyManager.startGame(data.lobbyID);
            this.scopedConnections[data.lobbyID].forEach((con, index) => {
              game.playerIndex = index;
              con.socket.send(JSON.stringify(game));
            });
            // send messages to refresh when game is started
            this.connections.forEach((con) => {
              con.socket.send(
                JSON.stringify(this.lobbyManager.getOpenLobbies()),
              );
            });
            break;
          case "createLobby":
            // create the new lobby
            let newLobbyInfo = this.lobbyManager.createLobby(data.username);
            let lobbyInfo = this.lobbyManager.getOpenLobbies();
            this.connections.forEach((con) => {
              con.socket.send(JSON.stringify(lobbyInfo));
            });
            // send message to creator to join lobby
            connection.socket.send(
              JSON.stringify({
                case: "creatorJoin",
                lobbyID: newLobbyInfo.lobbyID,
              }),
            );
            // add the socket connection to the lobby
            this.scopedConnections[newLobbyInfo.lobbyID] = [connection];
            // send update to people in lobby that it's been joined
            this.sendUpdateToPlayers(newLobbyInfo.lobbyID);
            break;
          case "chat":
            let chat = this.lobbyManager.updateChat(data);
            // let chat = updateChat(data);
            this.scopedConnections[data.lobbyID].forEach((con) => {
              con.socket.send(JSON.stringify(chat));
            });
            break;
          case "joinLobby":
            this.scopedConnections[data.lobbyID].push(connection);
            this.lobbyManager.joinLobby(data.lobbyID, connection.username);
            // await joinLobby(data.lobbyID, connection.username);
            // get the list of lobbies again to remove full lobbies from list
            let lobbiesToSend = this.lobbyManager.getOpenLobbies();
            this.connections.forEach((con) => {
              con.socket.send(JSON.stringify(lobbiesToSend));
            });
            // send message to joiner to join lobby
            connection.socket.send(
              JSON.stringify({
                case: "creatorJoin",
                lobbyID: data.lobbyID,
              }),
            );
            // send update to people in lobby that it's been joined
            this.sendUpdateToPlayers(data.lobbyID);
            break;
        }
      });

      // process a closure
      socket.on("close", () => {
        let index = this.connections.findIndex((co) => co.id === connection.id);
        if (index >= 0) {
          this.connections.splice(index, 1);
        }
      });

      // receive pings and pongs to maintain connection
      socket.on("pong", () => {
        connection.alive = true;
      });
    });

    setInterval(() => {
      this.connections.forEach((con) => {
        // if client has been dormant between checks, terminate them
        if (con.alive === false) return con.socket.terminate();

        // set this flag between connection
        con.alive = false;

        con.socket.ping();
      });
    }, 10000);
  }

  sendUpdateToPlayers(lobbyID) {
    let toSendPlayers = {
      case: "updatePlayers",
      players: this.lobbyManager.getPlayers(lobbyID).players,
    };
    this.scopedConnections[lobbyID].forEach((con) => {
      con.socket.send(JSON.stringify(toSendPlayers));
    });
  }

  async handleGuess(guesser, guess) {
    const response = this.lobbyManager.attemptGuess(guesser, guess);
    // update the history based on the guess
    await this.updateHistory(guesser, guess.player, guess.room, guess.weapon);
    return response;
  }

  async updateHistory(guesser, person, room, weapon) {
    // set up the object
    let histItem = {
      date: Date.now(),
      guesser: guesser.username,
      person: person,
      room: room,
      weapon: weapon,
    };
    await this.DB.addUserHistory(histItem);
  }

  broadcastMessage(message) {
    const stringMessage = JSON.stringify(message);
    this.connections.forEach((con) => {
      con.socket.send(stringMessage);
    });
  }
};
