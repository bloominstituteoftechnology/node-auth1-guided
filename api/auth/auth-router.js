const bcrypt = require('bcryptjs');

const express = require('express');

const Users = require('../users/users-model');

const router = express.Router();


function usernameIsUnique(req, res, next) {
    next();
}

router.post('/register', usernameIsUnique, async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const hash = bcrypt.hashSync(password, 12);

        const user = { username, password: hash };
        await Users.add(user);

        res.status(201).json({ message: `You are now registered, ${username}!`})
    } catch(err) {
        next(err);
    }
});

router.post('/login', (req, res, next) => {
    try {
        const { username, password } = req.body;

        // SELECT * FROM users WHERE username = 'whatever'
        // Users.findBy('username', username)


        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

        res.json(query);

    } catch(err) {
        next(err);
    }
});

// router.get('/logout', (req, res) => {});

module.exports = router;