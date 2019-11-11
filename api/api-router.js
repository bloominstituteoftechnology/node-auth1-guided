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
  // hash the password using bcryptjs
  // return it to the user in an objet that looks like
  // { password: 'original password, hash: 'hashed password'}
  const password = req.body.password;
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      // Store hash in your password DB.
      res.status(200).json({
        password: password,
        hash: hash
      });
    });
  });
});

module.exports = router;
