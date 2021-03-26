const router = require("express").Router();

const Users = require("./users-model.js");

router.get("/", (req, res, next) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(next); // our custom err handling middleware in server.js will trap this
});

module.exports = router;
