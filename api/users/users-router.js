const router = require("express").Router();

const Users = require("./users-model.js");

function restrict(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    next({ message: 'nopz', status: 401})
  }
}

router.get("/", restrict, (req, res, next) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(next);
});

module.exports = router;
