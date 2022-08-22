const bcrypt = require('bcryptjs');

const express = require('express');

const router = express.Router();

router.post('/register', (req, res) => {
    const { username, password } = req.body;

    res.json({ hash: bcrypt.hashSync(password, 12) });
});

// router.post('/login', (req, res) => {});

// router.get('/logout', (req, res) => {});

module.exports = router;