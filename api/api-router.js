const router = require('express').Router();

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');

router.use('/auth', authRouter);
router.use('/users', usersRouter);

router.get('/', (req, res) => {
  res.json({ api: "It's alive" });
});

router.post('/hash', (req, res) => {
  const password = req.headers.authorization;

  if (password) {
    const hash = bcrypt.hashSync(password, 8);

    res.status(200).json({ hash });
  } else {
    res.status(400).json({ message: 'Please provide credentials'})
  }
})

module.exports = router;
