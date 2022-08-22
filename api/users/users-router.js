const router = require("express").Router()

const Users = require("./users-model.js")

function mustBeAdmin(req, res, next) {
  if(req.session.user && req.session.user.username == 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'forbidden!' });
  }
}


router.get("/", mustBeAdmin, (req, res, next) => {
  Users.find()
    .then(users => {
      res.status(200).json(users)
    })
    .catch(next)
})

router.get('/userinfo', (req, res) => {
  res.status(200).json(req.session.user);
})

// router.get('/number/:n', (req, res) => {
//   const n = req.session.number;
//   req.session.number = req.params.n;
//   res.status(200).json(n);
// })

module.exports = router
