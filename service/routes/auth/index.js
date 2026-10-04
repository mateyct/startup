const express = require("express");
const dbHelpers = require("../../helpers/dbHelpers");
const bcrypt = require("bcryptjs");
const {
  setAuthCookie,
  createUser,
  clearAuthCookie,
} = require("../../helpers/authHelpers");

module.exports = (DB) => {
  const router = express.Router();

  const { getUser } = dbHelpers(DB);

  router.post("/", async (req, res) => {
    if (await getUser("username", req.body.username)) {
      res.send(409, { msg: "User already exists" });
    } else {
      const user = await createUser(req.body.username, req.body.password);
      setAuthCookie(res, user);
      DB.addUser(user);
      res.json({ username: req.body.username });
    }
  });

  router.put("/", async (req, res) => {
    const user = await getUser("username", req.body.username);
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      setAuthCookie(res, user);
      // login user in the database
      DB.updateUser(user);
      res.json({ username: req.body.username });
    } else {
      res.send(401, { msg: "Unauthorized" });
    }
  });

  // logout a user
  router.delete("/", async (req, res) => {
    const token = req.cookies["token"];
    const user = await getUser("token", token);
    if (user) {
      clearAuthCookie(res, user);
      // if there is a user in a game, we want to get rid of the game
      const lobbyInfo = checkUserInLobby(user.username);
      if (lobbyInfo) {
        delete lobbies[lobbyInfo.key];
        // send messages to refresh when game is started
        connections.forEach((con) => {
          con.socket.send(JSON.stringify(getLobbies()));
        });
      }
      // log the user out
      await DB.updateUser(user);
    }
    res.json({ msg: "Logged out" });
  });

  return router;
};
