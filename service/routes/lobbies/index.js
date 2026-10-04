const express = require("express");

module.exports = (lobbyManager) => {
  const router = express.Router();

  router.get("/player-status", async (req, res) => {
    // get if in lobby
    const user = req.user;
    const lobbyInfo = lobbyManager.checkUserInLobby(user.username);
    // send needed lobby info if in game, if not, don't
    if (lobbyInfo) {
      const lobby = lobbyManager.getLobby(lobbyInfo.key);
      res.json({
        found: true,
        lobbyID: lobbyInfo.key,
        inGame: lobby.inGame,
        playerIndex: lobbyInfo.playerIndex,
        players: lobby.players,
        turn: lobby.turn,
        winner: lobby.winner,
        chatlog: lobby.chatlog,
      });
    } else {
      res.json({ found: false });
    }
  });

  // return the list of lobby IDs
  router.get("/", (req, res) => {
    res.send({ lobbies: lobbyManager.getOpenLobbies().lobbies });
  });

  return router;
};
