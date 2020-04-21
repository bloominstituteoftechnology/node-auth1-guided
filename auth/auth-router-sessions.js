const router = require("express").Router();
const bcrypt = require("bcryptjs")

const Users = require("../users/users-model");

router.post("/register", (req, res) => {
  let user = req.body; // username, password
  const rounds = process.env.HASH_ROUNDS || 8;
  // rounds are 2 to the n times, want this number as high as you can without taking too long for user
  // takes fine tuning in prod server
// hash the creds.password
  const lockdown = bcrypt.hashSync(user.password, rounds)
// update the creds to use the hash
  user.password = lockdown;
// NEVER save the password in plain text
  
  Users.add(user).then(saved => {
    res.status(201).json(saved)
  }).catch(error => {
    console.log(error);
    res.status(500).json({ errorMessage: error.message })
  })
});

router.post("/login", (req, res) => {
  let {username, password } = req.body;

  // search for the user using the username
  Users.findBy({ username })
  .then(found => { // can also destructure with ([found])
    // found equates to user from lecture
    console.log('user', found) // logs an array
    // if we find the user also check if the passwords match
    if(found && bcrypt.compareSync(password, found[0].password)){
      req.session.loggedIn = true; // assigned to session object, allows us to use it everywhere else until server is restarted (in this case cuz its in memory)
      // check that the passwords match (magic, library compares the hashes and does it effectively)
      // this is where an async check would happen (diff from compareSync)
      res.status(200).json({ message: `Welcome ${username}`})
    } else {
      res.status(401).json({ message: 'Can\'t sit here'})
    }

  }).catch(error => {
    console.log(error);
    res.status(500).json({ errorMessage: error.message })
  })
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err){
      res.status(500).json({ errorMessage: 'escape denied'})
    } else {
      // 204 means all good, but no data for client
      res.status(204).end()
    }
  })
})

module.exports = router;