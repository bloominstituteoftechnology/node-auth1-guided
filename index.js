const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database/dbHelpers.js');
const server = express();

server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send('Its Alive!');
});

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.post('/api/register', (req,res) => {
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, 20);
    if(!user) res.status(400).json({Message: `Please enter a valid user name and password`});
    console.log(user);
    db.insertUser(user)
    .then( ids => {
       console.log('line31:',ids);
       res.status(201).json({id:ids[0]});
    }).catch(err => {
       res.status(500).json({Message: `Failed to register at this time`});
    })
});

server.post('/api/login', (req,res) => {
    const userBody = req.body;
    db.findByUsername(userBody.username)
    .then( users => {
       if(users.length && bcrypt.compareSync(userBody.password, users[0].password)) {
          res.status(200).json({Message: `Correct`});
       } else {
          res.status(404).json({Message: `Invalid username and password`});
       }
    })
    .catch(err => {
         res.status(500).json({err: `Something went wrong`})
    })
     
});

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
