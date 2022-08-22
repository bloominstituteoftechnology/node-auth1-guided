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

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // SELECT * FROM users WHERE username = 'whatever'
        const user = await Users.findBy({'username': username }).first();

        if(user == null) {
            next({ status: 401, message: `Invalid credentials!`});
            return;
        }

        if(bcrypt.compareSync(password, user.password)) {
            res.json({ message: `You are now logged in, ${username}! Here is your id: ${req.session.id}`});
        } else {
            next({ status: 401, message: `Invalid credentials!`});
        }

    } catch(err) {
        next(err);
    }
});

// router.get('/logout', (req, res) => {});

module.exports = router;