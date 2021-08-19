const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session)

const usersRouter = require('./users/users-router.js');
const authRouter = require("./auth/auth-router.js");

const server = express();

server.use(session({
  // config of cookie and session store
  name: 'monkey', // name of the cookie
  secret: 'keep it secret, keep it safe!', // env, not code
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false, // if true, the cookie is not set unless it's an https connection
    httpOnly: true, // if true, the cookie is not accessible thru document.cookie
  },
  resave: false, // some data stores need this set to true
  saveUninitialized: false, // privacy implications, if false, no cookie is set on the client unless the req.session is changed
  store: new KnexSessionStore({
    knex: require('../database/db-config.js'), // configured instance of knex
    tablename: 'sessions', // table that will store sessions inside the db, name it anything you want
    sidfieldname: 'sid', // column that will hold the session id, name it anything you want
    createtable: true, // will create table auto
    clearInterval: 1000 * 60 * 60, // time it takes to check for old sessions and remove them from the db to keep it clean and performant
  }),
}));
server.use(helmet());
server.use(express.json());

server.use('/api/users', usersRouter);
server.use("/api/auth", authRouter);

server.get('/', (req, res) => {
  res.json({ api: "up"});
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
