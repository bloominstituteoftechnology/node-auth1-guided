const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database/dbHelpers.js');
const server = express();
const session = require('express-session');
const jwt = require('jsonwebtoken');

const protect = (req,res,next) => {
   if(req.session && req.session.userId) {
       next();
   } else {
      res.status(400).json({Message: `Access denied`});
  }
}

server.use(express.json());
server.use(cors());
server.use(
   session({
     name: 'notsession', // default is connect.sid
     secret: 'nobody tosses a dwarf!',
     cookie: {
       maxAge: 1 * 24 * 60 * 60 * 1000       
     }, // 1 day in milliseconds
     httpOnly: true, // don't let JS code access cookies. Browser extensions run JS code on your browser!
     resave: false,
     saveUninitialized: false,
   })
 );

server.get('/', (req, res) => {
  res.send('Its Alive!');
});



server.post('/api/register', (req,res) => {
    const user = req.body;
    console.log('session', req.session);
    user.password = bcrypt.hashSync(user.password, 10);
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
          req.session.userId = users[0].id;
          //redirect to the login screen
          // we send back  info that allows the front end  to display a new error message.

          res.status(200).json({Message: `Correct`});
       } else {
          res.status(404).json({Message: `Invalid username and password`});
       }
    })
    .catch(err => {
         res.status(500).json({err: `Something went wrong`})
    })
     
});

// protect this route, only authenticated users should see it
server.get('/api/users', protect, (req, res) => {
    console.log('session', req.session);
    db.findUsers()
             .then( users => {
                res.status(200).json(users)
             })
             .catch(err => {
                 res.status(500).json({errorMessage: err});
             })
 });

 server.post('/api/logout', (req,res) => {
         req.session.destroy( err => {
             if(err) {
                res.status(500).send(`Failed to logout`);
             } else {
                res.send(`Logout successful`);
             }
         })
 });
 //Psuedo code for managing messages.
//  server.get('/api/messages', (req,res)=> {
//        //check for session and user id
//        db.findMessagesByuser(req.session.userId);
//  })

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
