const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const db = require("./database/dbConfig.js");

const server = express();

const sessionsConfig = {
  name: "monkey", // default is connect.sid
  secret: "nobody tosses a dwarf!",
  cookie: {
    maxAge: 1 * 24 * 60 * 60 * 1000, // a day
    secure: false // only set cookies over https. Server will not send back a cookie over http.
  }, // 1 day in milliseconds
  httpOnly: true, // don't let JS code access cookies. Browser extensions run JS code on your browser!
  resave: false,
  saveUninitialized: false
};

server.use(session(sessionsConfig));

server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("Its Alive!");
});

server.post("/api/register", (req, res) => {
  // grab credentials
  const creds = req.body;

  // hash the password                      //2^3 = 8 times
  const hash = bcrypt.hashSync(creds.password, 3);

  // replace user password with the hash
  creds.password = hash;

  // save the user
  db("users")
    .insert(creds)
    .then(ids => {
      const id = ids[0];
      res.status(200).json(id);
      // return 200
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

server.post("/api/login", (req, res) => {
  // grab credentials
  const creds = req.body;

  // find the user
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        req.session.username = user.username;

        res.status(200).send(`Welcome ${req.session.username}`);
      } else {
        res.status(401).json({ Error: "Cannot Authorize" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ Error: "Login Failed" });
    });
});

server.get("/setname", (req, res) => {
  req.session.name = "Frodo";
  res.send("got it");
});

server.get("/greet", (req, res) => {
  const name = req.session.username;
  res.send(`hello ${name}`);
});

// protect this route, only authenticated users should see it
server.get("/api/users", (req, res) => {
  // only send the list of users if the client is logged in
  if (req.session && req.session.username) {
    db("users") //password is optional//
      .select("id", "username")
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  } else {
    res.status(401).json({ Error: "You shall not pass!!" });
  }
});

server.get("/api/admins", (req, res) => {
  // only send the list of users if the client is logged in
  // user = { username 'foo', role: 'admin' }
  if (req.session && req.session.role === "admin") {
    db("users") //password is optional//
      .select("id", "username")
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  } else {
    res.status(403).json({ Error: "You have no access to this resource" });
  }
});

server.listen(3300, () => console.log("\nrunning on port 3300\n"));
