const express = require("express");

module.exports = (DB) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const user = req.user;
    let hist = await DB.getUserHistory(user.username);
    res.json({ history: hist });
  });
  return router;
};
