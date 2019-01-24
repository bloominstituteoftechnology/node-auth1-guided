const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database/dbHelpers.js');
const server = express();
const session = require('express-session');
const jwt = require('jsonwebtoken');

const secret = "this is secret";

const protected = (req,res,next) => {
//    if(req.session && req.session.userId) {
//        next();
//    } else {
//       res.status(400).json({Message: `Access denied`});
//   }
        // --> Read the token string from the Authorization header
        const token = req.headers.authorization;
        //verify the token
        if(token) {    
            jwt.verify(token, secret, (err, decodedToken) => {
                  if(err) {
                     //token is invalid
                     res.status(401).json({Message: `Invalid Token`});
                  } else {
                     //token is valid
                     req.username = decodedToken.username;
                     next();
                  }
            });
         } else {
            res.status(401).json({Message:`No token provided`});
         }   
       
}

const generateToken = (user) => {
     const payload = {username: user.username};
    
     const options = {
        expiresIn: '1h',
        jwtid: '12345'
     }
     const token = jwt.sign(payload, secret, options);
      return token;
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
        const id = ids[0];
        //Find the user using the id
          db.findUserById(id)
            .then(user => {
                const token =  generateToken(user.username); 
                console.log('line31:',ids);
                res.status(201).json({id:user.id, token});
            })
            .catch(err => {
                res.status(500).send(err);
            })
             
    }).catch(err => {
       res.status(500).json({Message: `Failed to register at this time`});
    })
});

server.post('/api/login', (req,res) => {
    const userBody = req.body;
    db.findByUsername(userBody.username)
    .then( users => {
       if(users.length && bcrypt.compareSync(userBody.password, users[0].password)) {
         //   req.session.userId = users[0].id;
          //redirect to the login screen
          // we send back  info that allows the front end  to display a new error message.
          // Using JWT -> Generate a token
          const token = generateToken(users);
          // Attach that token to the response.

          res.status(200).json({token});
       } else {
          res.status(404).json({Message: `Invalid username and password - No access`});
       }
    })
    .catch(err => {
         res.status(500).json({err: `Something went wrong`})
    })
     
});

// protect this route, only authenticated users should see it
server.get('/api/users', protected, (req, res) => {
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
