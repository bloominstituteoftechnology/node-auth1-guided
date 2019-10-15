const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const db = require("./database/dbConfig.js");
const Users = require("./users/users-model.js");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("It's alive!");
});

server.post("/api/register", (req, res) => {
  let user = req.body;

  // validate the user

  // hash the password
  const hash = bcrypt.hashSync(user.password, 8);

  // we override the password with the hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: "You cannot pass!!" });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  } else {
    res.status(400).json({ message: "please provide credentials" });
  }
});

server.get("/api/users", protected, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get("/hash", (req, res) => {
  // read a password from the Authorization header
  const password = req.headers.authorization;

  if (password) {
    // that 8 is how we slow down attackers trying to pre-generate hashes
    const hash = bcrypt.hashSync(password, 10); // the 8 is the number of rounds 2 ^ 8
    // a good starting value is 14

    res.status(200).json({ hash });
    // return an object with the password hashed using bcryptjs
    // { hash: '970(&(:OHKJHIY*HJKH(*^)*&YLKJBLKJGHIUGH(*P' }
  } else {
    res.status(400).json({ message: "please provide credentials" });
  }
});

// implement the protected middleware that will check for username and password
// in the headers and if valid provide access to the endpoint
function protected(req, res, next) {
  let { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: "You cannot pass!!" });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  } else {
    res.status(400).json({ message: "please provide credentials" });
  }
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
