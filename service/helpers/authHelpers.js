const uuid = require("uuid");
const bcrypt = require("bcryptjs");

// sets the auth cookie
function setAuthCookie(res, user) {
  user.token = uuid.v4();
  res.cookie("token", user.token, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
}

// clears the auth cookie
function clearAuthCookie(res, user) {
  delete user.token;
  res.clearCookie("token");
}

async function createUser(username, password) {
  // set up hashed password with user
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    username: username,
    password: passwordHash,
  };
  return user;
}

module.exports = {
  setAuthCookie,
  clearAuthCookie,
  createUser,
};
