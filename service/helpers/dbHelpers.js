const createGetUser = (DB) => async (field, value) => {
  if (!value) return null;
  // get user from DB
  if (field === "token") {
    return DB.getUserByToken(value);
  }

  return DB.getUser(value);
};

const createVerifyUser = (DB) => async (req, res, next) => {
  const user = await createGetUser(DB)("token", req.cookies.token);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: "Unauthorized" });
  }
};

module.exports = (DB) => ({
  getUser: createGetUser(DB),
  verifyUser: createVerifyUser(DB),
});
