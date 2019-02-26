const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')

const db = require('./database/dbConfig.js');
const Users = require('./users/users-module.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

// Registration
server.post('/api/register', (req, res) => {
  //grab username and password from body
  const creds = req.body
  //generate the hash from user's passowrd
  const hash = bcrypt.hashSync(creds.password, 14) //rounds is 2^x
  //override the user.password with the hash
  creds.password = hash
  //save user to the database
  db('users')
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids)
    })
    .catch(err => json(err))
})

// Login
server.post('/api/login', (req, res) => {
  //grab username and password from body
  const creds = req.body
  db('users')
    .where({ username: creds.username })
    .first() //only get one record back
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        //passwords match and user exists by that username
        res.status(200).json({ message: 'Login Successful!' })
      } else {
        // Either the username is invalid or password is wrong
        res.status(401).json({ message: 'Thou shalt not pass!' })
      }
    })
    .catch(err => res.json(err))
})

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
