const router = require("express").Router();

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");

var bcrypt = require("bcryptjs");

router.use("/auth", authRouter);
router.use("/users", usersRouter);

router.get("/", (req, res) => {
  res.json({ api: "It's alive" });
});

router.post("/hash", (req, res) => {
  // read a password from the body
  const password = req.body.password;
  // hash the password using bcryptjs
  const hash = bcrypt.hashSync(password, 8);
  // return it to the user in an objet that looks like
  // { password: 'original password, hash: 'hashed password'}
  res.status(200).json({ password, hash });
});

module.exports = router;
