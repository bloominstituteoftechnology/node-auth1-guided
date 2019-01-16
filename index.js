const express = require('express');
const cors = require('cors');

const db = require('./database/dbConfig.js');

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
    if(!user) res.status(400).json({Message: `Please enter a valid user name and password`});
    console.log(user);
    db('users').insert(user)
    .then( ids => {
       console.log('line31:',ids);
       res.status(201).json({id:ids[0]});
    }).catch(err => {
       res.status(500).json({Message: `Failed to register at this time`});
    })
});

server.post('/api/login', (req,res) => {
    const userBody = req.body;
    db('users')
    .where('username', userBody.username)
    .then( users => {
       if(users.length && users[0].password === userBody.password) {
          res.status(200).json({Message: `Correct`});
       } else {
          res.status(404).json({Message: `Invalid username and password`});
       }
    })
    .catch(err => {
         res.status(500).json({err: `Something went wrong`})
    })
     
})

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
