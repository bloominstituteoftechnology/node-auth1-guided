const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')


const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;

// validate the user
  
// hash the password
  const hash = bcrypt.hashSync(user.password, 12);
  
  // we override the password with the hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;



  Users.findBy({ username })
    .first()
    .then(user => {

      if (user && bcrypt.compare(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', protected,(req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get("/hash", (req, res) => {
  
  // return an object with the password hashed using bcryptjs
  // { hash: '970(&(:OHKJHIY*HJKH(*^)*&YLKJBLKJGHIUGH(*P' }

 // read a password from the Authorization header
  const password = req.headers.authorization;

  if (password) {
    // that 12 is how we slow down attackers trying to pre-generate hashes
    const hash = bcrypt.hashSync(password, 12) // the 12 is the number of rounds 2^12
    // a good starting value is 14

  
    res.status(200).json({ hash })
  } else {
    res.status(400).json({message:"please provide credentials!"})
  }
});

// implement the protected middleware that will check for username and password
// in the headers and if valid provide access to the endpoint
function protected(req, res, next) {
  const username = req.headers.user;
  const password = req.headers.authorization;

  if (!req.body) {
    res.status(401).json({message:"please provide username and password"})
  }
  Users.findBy({ username })
    .first()
    .then(user => {
      if (!user || !bcrypt.compare(password, user.password)) {
        res.status(401).json({ message: `Invalid Credentials` });
      } else {
        next();
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));


