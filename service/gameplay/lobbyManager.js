const ServerPlayer = require("../ServerPlayer");
const gameData = require("../clueData.json");

module.exports = class LobbyManager {
  constructor() {
    this.lobbies = {};
  }

  checkUserInLobby(username) {
    let correctKey = null;
    let keys = Object.keys(this.lobbies);
    keys.forEach((key) => {
      this.lobbies[key].players.forEach((player, index) => {
        if (player.name == username) {
          correctKey = { key: key, playerIndex: index };
        }
      });
    });
    return correctKey;
  }

  getLobby(key) {
    if (this.lobbies[key]) {
      return this.lobbies[key];
    }
    return null;
  }

  getOpenLobbies() {
    const lobbiesToSend = {};
    let keys = Object.keys(this.lobbies);
    keys.forEach((key) => {
      if (!this.lobbies[key].inGame && this.lobbies[key].players.length < 4) {
        lobbiesToSend[key] = {
          lobbyName: this.lobbies[key].lobbyName,
        };
      }
    });
    return { case: "newLobby", lobbies: lobbiesToSend };
  }

  createLobby(username) {
    let randomID = Math.round(Math.random() * 100000);
    let newLobby = {
      lobbyName: username + "'s Game",
      players: [new ServerPlayer(username, 7, 0, 0)],
      inGame: false,
      turn: 0,
      winner: -1,
      chatlog: [
        {
          type: "line",
          message: "Welcome to Medical Murder Mystery!",
        },
      ],
    };
    this.lobbies[randomID] = newLobby;
    return { lobbyID: randomID, case: "newLobby" };
  }

  joinLobby(lobbyId, username) {
    if (this.lobbies[lobbyId].players.length >= 4) {
      return { msg: "lobby full" };
    }
    this.lobbies[lobbyId].players.push(
      new ServerPlayer(username, 0, 0, this.lobbies[lobbyId].players.length),
    );
  }

  startGame(lobbyId) {
    this.lobbies[lobbyId].inGame = true;
    // generate the solution to the murder
    const players = this.lobbies[lobbyId].players;
    const rooms = Object.keys(gameData.roomIdNames);
    const weapons = Object.keys(gameData.weaponIdNames);
    // set the solution of the game
    this.lobbies[lobbyId].solution = {
      player: players[Math.floor(Math.random() * players.length)].name,
      room: rooms[Math.floor(Math.random() * rooms.length)],
      weapon: weapons[Math.floor(Math.random() * weapons.length)],
    };
    // set player locations
    let locOpts = [
      { x: 7, y: 0 },
      { x: 16, y: 23 },
      { x: 16, y: 0 },
      { x: 7, y: 23 },
    ];
    // loop to set
    this.lobbies[lobbyId].players.forEach((player, index) => {
      player.x = locOpts[index].x;
      player.y = locOpts[index].y;
    });
    console.log(this.lobbies[lobbyId].solution);
    return { players: this.lobbies[lobbyId].players, case: "startGame" };
  }

  updateChat({ lobbyID, message }) {
    const chatlog = this.lobbies[lobbyID].chatlog;
    chatlog.unshift(message);
    return chatlog;
  }

  updatePlayer({
    lobbyID,
    index,
    turn,
    moves,
    recentArrival,
    currentRoom,
    x,
    y,
  }) {
    // set all of these things
    const lobby = this.lobbies[lobbyID];
    const players = lobby.players;
    players[index].x = x;
    players[index].y = y;
    lobby.turn = turn;
    players[index].moves = moves;
    players[index].recentArrival = recentArrival;
    players[index].currentRoom = currentRoom;
  }

  buildGuess(guesser, guess, fieldName, lobby, response) {
    if (guess[fieldName] === lobby.solution[fieldName]) {
      response[fieldName] = true
      guesser.guesses[guess[fieldName]] = true
      return 1
    }
    guesser.guesses[guess[fieldName]] = false
    return 0
  }

  attemptGuess(guesser, guess) {
    const { lobbyID, nextTurn } = guess
    const lobby = this.lobbies[lobbyID];
    // get which is the guessor
    lobby.players.forEach((player) => {
      if (player.name == guesser.username) {
        guesser = player;
      }
    });
    let correctFlags = 0; // 3 flags is a winner
    // winner will be -1 until the winner is set
    const response = {
      winner: -1,
      player: false,
      room: false,
      weapon: false,
      case: "guessResult",
    };
    correctFlags += this.buildGuess(guesser, guess, 'player', lobby, response)
    correctFlags += this.buildGuess(guesser, guess, 'room', lobby, response)
    correctFlags += this.buildGuess(guesser, guess, 'weapon', lobby, response)
    // check if they won
    if (correctFlags >= 3) {
      response.winner = guesser.index;
      // delay for a bit, then end the game
      setTimeout(() => {
        delete this.lobbies[lobbyID];
      }, 6000);
    }
    // set the correctness of the guesses to send back
    response.results = guesser.guesses;
    lobby.turn = nextTurn;
    lobby.winner = response.winner;
    guesser.recentArrival = false;
    return response;
  }

  getPlayers(lobbyID) {
    let data = { found: false };
    // find the lobby data
    const lobby = this.getLobby(lobbyID);
    if (lobby) {
      data = {
        found: true,
        case: "updatePos",
        players: lobby.players,
        turn: lobby.turn,
        winner: lobby.winner,
        chatlog: lobby.chatlog,
      };
    }
    return data;
  }

  deleteLobby(lobbyID) {
    delete this.lobbies[lobbyID];
  }
};
