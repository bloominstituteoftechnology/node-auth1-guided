const router = require("express").Router()

const Users = require("./users-model.js")

router.get("/", (req, res, next) => {
  Users.find()
    .then(users => {
      res.status(200).json(users)
    })
    .catch(next)
})

router.get('/userinfo', (req, res) => {
  res.status(200).json(req.session.user);
})

router.get('/number/:n', (req, res) => {
  const n = req.session.number;
  req.session.number = req.params.n;
  res.status(200).json(n);
})

module.exports = router
