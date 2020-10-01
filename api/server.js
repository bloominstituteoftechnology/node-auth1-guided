const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require('../api/errorHandler.js') // added
const session = require('express-session'); // added
const KnexSessionStore = require('connect-session-knex')(session); // added

const usersRouter = require("../users/users-router.js");
const authRouter = require('../auth/auth-router.js');  // added

const server = express();

// we are changing the sessionConfig to support the connect-session-knex
const sessionConfig = { // added
  name: "smhcookie",
  secret: "I can't tell you because it is a secret",
  cookie: {
    maxAge: 60 * 60 *1000, // this equals an hour
    secure: false,  // this is false during testing but true when we deploy
  },
  httpsOnly: true,
  resave: false, 
  saveUninitialize: false,


  store: new KnexSessionStore ({
    knex: require("../database/connection.js"),
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: "true",
    clearInterval: 1000 * 60 * 60
  })

}

server.use(session(sessionConfig)); // added
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use("/api/users", usersRouter);
server.use('/api/auth', authRouter); // added


server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use(errorHandler); // added 
// always add at the very end of the chain, so any other middleware in our stack
// if it happens to call next with an object it will end up down here

module.exports = server;
