const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session"); // 1. Add express session

const db = require("./database/dbConfig.js");
const Users = require("./users/users-model.js");

const server = express();

// Session is stored in the server
// Cookie gets sent to the browser, and the cookie has the session id

// 3. Create sessionConfig object
const sessionConfig = {
  name: "monkey", // name for session, default is connect.sid but for security purposes we change it
  secret: "keep it secret, keep it safe!",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // length of session in ms
    secure: false // used for https only, false for dev for now
  },
  httpOnly: true, // user cannot access the cookie from js using document.cookie
  resave: false,
  saveUninitialized: false // GDPR laws agaisnt setting cookies automatically, need consent from the user
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig)); // 2. Use session and pass a sessionConfig object

server.get("/", (req, res) => {
  res.send("It's alive!");
});

server.post("/api/register", (req, res) => {
  let user = req.body;

  // generate has from user's passowrd
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n, where n is the 2nd arg in the function call

  // override user.password with hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      req.session.user = saved; // Save user so that he won't have to login after registering
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // check that passwords match
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user; // 4. This
        res
          .status(200)
          .json({ message: `Welcome ${user.username}! Have a cookie.` });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Protect this route, only authenticated users should see it
// Middleware
// 5. Middleware is simplified
function restricted(req, res, next) {
  if (req.session && res.session.user) {
    next();
  } else {
    res.status(401).json({ message: "You shall not pass!" });
  }
}

// function restricted(req, res, next) {
//   const { username, password } = req.headers;

//   if (username && password) {
//     Users.findBy({ username })
//       .first()
//       .then(user => {
//         if (user && bcrypt.compareSync(password, user.password)) {
//           next();
//         } else {
//           res.status(401).json({ message: "Invalid Crendentials" });
//         }
//       })
//       .catch(error => {
//         res.status(500).json({ message: "Ran into an unexpected error" });
//       });
//   } else {
//     res.status(400).json({ message: "No credentials provided" });
//   }
// }

server.get("/api/users", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get("/users", restricted, async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (error) {
    res.send(error);
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
