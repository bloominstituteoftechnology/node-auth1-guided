const router = require("express").Router();
const bcrypt = require("bcryptjs");

const Users = require("../users/users-model.js");

router.post("/register", (req, res) => {
    let creds = req.body;
    const rounds = 8;
    const hash = bcrypt.hashSync(creds.password, rounds);

    creds.password = hash;

    Users.add(creds)
        .then(saved => {
            res.status(201).json(saved);
        })
    .catch(error => {
        console.log(error);
        res.status(500).json({ errorMessage: error.message });
    });
});
module.exports = router;