const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
// require your story library
const KnexSessionStore = require("connect-session-knex")(session);

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
  saveUninitialized: false,
  store: new KnexSessionStore({
    tablename: "sessions",
    sidfieldname: "sid",
    knex: db,
    createtable: true,
    clearInterval: 1000 * 60 * 60
  })
};

server.use(session(sessionsConfig));

server.use(express.json());
server.use(cors());

function protected(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ Error: "You shall not pass!!" });
  }
}

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
        // grab roles from user
        // req.session.roles = roles;
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
server.get("/api/users", protected, (req, res) => {
  // only send the list of users if the client is logged in

  db("users") //password is optional//
    .select("id", "username", "password")
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get("/api/admins", protected, (req, res) => {
  // grab the logged in user id from the session
  if (req.session && req.session.userId) {
    const userId = req.session.userId;
    db("roles as r")
      .join("user_roles as ur", "ur.role_id", "=", "r.id")
      .select("r.role_name")
      .where("ur.user_id", userId)
      .then(roles => {
        if (roles.includes("admin")) {
          // have access
        } else {
          // bounced
        }
      });
  }

  // role can have many permissions
  // a user can have many roles
  // a user can have many permissions

  // query the db and get the roles for the user

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

server.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.send('error logging out');
      } else {
        res.send('good bye');
      }
    });
  }
});

server.listen(3300, () => console.log("\nrunning on port 3300\n"));
