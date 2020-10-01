const router = require('express').Router();
const users = require('../users/users-model.js');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res, next) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 12);
    user.password = hash;

    try {
        const saved = await users.add(user);
        res.status(201).json(saved);
    } catch (err) {
        next({ apiCode: 500, apiMessage: 'error registering', ...err })
    }
});

router.post('/login', async (req, res, next) => {
    let {username, password} = req.body;

    try {
        const [user] = await users.findBy({username});
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;  // this brings in our session
            console.log('added user to req.session!');
            res.status(200).json({ message: `Welcome ${user.username}!, have a cookie!` });
        } else {
            next({ apiCode: 401, apiMessage: "Invalid credentials" });
        }
    } catch (err) {
            next({ apiCode: 500, apiMessage: ' Error logging in', ...err });
    }
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                next({ apiCode: 400, apiMessage: "Error logging out", ...err });
            } else {
                res.send('So long & thanks for all the fish...!');
            }
        });  
    } else {
        res.send('Already logged out!');
    }
});




module.exports = router;

/*
    in the login post we want the first element of that array to be assigned to our variable

    in our try/catch statment 
    if the user exists and bcrypt.compareSync() returns true 

    what comes out of  the database is going to have our cost factor and the salt
    so bcrypt will do is take the salt and add it to the password guess
    then will pass that whole thing in with the cost factor to compareSync() 
    then the compareSync() will hash it the proper # of times (in our example 12)
    the compare what it comes up with with the actual hash that is in our password property
    and if they match, it will just return to true

*/