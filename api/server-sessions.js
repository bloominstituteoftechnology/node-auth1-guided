const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session")
const KnexSessionsStore = require('connect-session-knex')(session) // remember to pass session

const usersRouter = require("../users/users-router.js");
const authRouter = require("../auth/auth-router-sessions.js");
const authenticator = require("../auth/authenticator");
const dbConnection = require('../database/dbConfig');

const server = express();

// should change with something like below code so ppl don't know what you're using
const sessionConfig = {
  name: 'monster',
  secret: process.env.SESSION_SECRET || 'TOP SECRET',
  resave: false,
  // make sure the client said okay to cookies and be able to set to false. Can be true in development
  cookie: {
    maxAge: 1000 * 60 * 10, // good for 10 mins
    secure: process.env.USE_SECURE_COOKIES || false, // https only set to true in production. ALWAYS use https
    httpOnly: true, // true means JS on the client cannot access the cookie. ALWAYS set this to true barring some special exceptions
  },
  // in the store DO NOT forget the new keyword, it is a constructor function
  // the store property controls where the session is stored, by default it is in memory
  store: new KnexSessionsStore({
    knex: dbConnection, // connects to the database
    tablename: 'sessions',
    sidfieldname: 'sid', 
    createtable: true, // adds table if one doesn't exist
    clearInterval: 1000 * 60 * 60, // clears expired sessions
  })
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/users", usersRouter);
server.use("/api/auth", authRouter)

server.get("/", (req, res) => {
  res.json({ api: "up" });
});



module.exports = server;
