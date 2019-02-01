const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs')

const db = require('./database/dbConfig.js');

const server = express();

server.use(express.json());
server.use(cors());

//REGISTRATION
server.post('/api/register', (req, res) => {
//grab username and password from body
const creds = req.body
//generate the hash from user's passowrd
const hash = bcrypt.hashSync(creds.password, 14) //rounds is 2^x
//override the user.password with the hash
creds.password = hash
//save user to the database
db('users').insert(creds).then(ids => {
  res.status(201).json(ids)
}).catch(err => json(err))

})

server.get('/', (req, res) => {
  res.send('Its Alive!');
});

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username', 'password') //<----NEVER EVER SEND THE PASSWORD BACK TO THE CLIENT, THIS IS WHAT NOT TO DO!!!
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
