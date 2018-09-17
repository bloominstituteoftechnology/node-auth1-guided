const express = require("express");
const cors = require("cors");

const db = require("./database/dbConfig.js");
var bcrypt = require("bcryptjs");
const server = express();

server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("Its Alive!");
});

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username', 'password')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.post("/api/register", (req, res) => {
    const creds = req.body;
    const hash = bcrypt.hashSync(creds.password, 3);
    creds.password = hash;

    db("users")
      .insert(creds)
      .then(ids => {
        const id = ids[0];
        res.status(201).json(id);
      })
      .catch(err => res.status(500).send(err));
  }
);

server.post('/api/login', (req, res) => {
  const creds = req.body;
  db('users')
  .where({username: creds.username})
  .first()
  .then(user => {
    if(user && bcrypt.compareSync(creds.password, user.password)){
      res.status(200).send('Welcome')
    } else {
      res.status(401).json({message: 'No admittance'})
    }
  })
})
server.listen(3300, () => console.log("\nrunning on port 3300\n"));
