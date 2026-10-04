const uuid = require("uuid");
const dbHelpers = require("../helpers/dbHelpers");

module.exports = class ConnectionManager {
  constructor(lobbyManager, socketServer, DB) {
    this.connections = [];
    this.scopedConnections = {};
    this.lobbyManager = lobbyManager;
    this.DB = DB;
    this.setupWSHandlers(socketServer);
    this.dbActions = dbHelpers(DB);
  }

  setupWSHandlers(socketServer) {
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
      socket.on("message", async (data) => {
        data = JSON.parse(data);
        switch (data.case) {
          case "updatePos":
            this.updatePos(data);
            break;
          case "update":
            this.updateGame(data);
            break;
          case "guess":
            await this.guess(data, connection);
            break;
          case "startGame":
            this.startGame(data);
            break;
          case "createLobby":
            this.createLobby(data, connection);
            break;
          case "chat":
            this.chat(data);
            break;
          case "joinLobby":
            this.joinLobby(data, connection);
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

  updatePos(data) {
    this.lobbyManager.updatePlayer(data);
    const players = this.lobbyManager.getPlayers(data.lobbyID);

    this.scopedConnections[data.lobbyID].forEach((con, index) => {
      players.playerIndex = index;
      con.socket.send(JSON.stringify(players));
    });
  }

  updateGame(data) {
    // get player info from the server and send it to each connection in lobby
    const players = this.lobbyManager.getPlayers(data.lobbyID);
    this.scopedConnections[data.lobbyID].forEach((con, index) => {
      players.playerIndex = index;
      con.socket.send(JSON.stringify(players));
    });
  }

  async guess(data, connection) {
    let player = await this.dbActions.getUser("username", data.guesser);
    const result = await this.handleGuess(player, data);
    const players = this.lobbyManager.getPlayers(data.lobbyID);
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
  }

  startGame(data) {
    let game = this.lobbyManager.startGame(data.lobbyID);
    this.scopedConnections[data.lobbyID].forEach((con, index) => {
      game.playerIndex = index;
      con.socket.send(JSON.stringify(game));
    });
    // send messages to refresh when game is started
    this.broadcastLobbies();
  }

  createLobby(data, connection) {
    let newLobbyInfo = this.lobbyManager.createLobby(data.username);
    this.broadcastLobbies();
    // send message to creator to join lobby
    connection.socket.send(
      JSON.stringify({
        case: "creatorJoin",
        lobbyID: newLobbyInfo.lobbyID,
      }),
    );
    this.scopedConnections[newLobbyInfo.lobbyID] = [connection];
    this.sendUpdateToPlayers(newLobbyInfo.lobbyID);
  }

  chat(data) {
    let chat = this.lobbyManager.updateChat(data);
    this.scopedConnections[data.lobbyID].forEach((con) => {
      con.socket.send(JSON.stringify(chat));
    });
  }

  joinLobby(data, connection) {
    this.scopedConnections[data.lobbyID].push(connection);
    this.lobbyManager.joinLobby(data.lobbyID, connection.username);
    // get the list of lobbies again to remove full lobbies from list
    this.broadcastLobbies();

    connection.socket.send(
      JSON.stringify({
        case: "creatorJoin",
        lobbyID: data.lobbyID,
      }),
    );
    this.sendUpdateToPlayers(data.lobbyID);
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

  broadcastLobbies() {
    this.broadcastMessage(this.lobbyManager.getOpenLobbies());
  }
};
