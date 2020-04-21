module.exports = (req, res, next) => {
    console.log('session', req.session) // with library wre using

    if(req.session.loggedIn) {
        next();
    } else {
        res.status(401).json({message: 'backup buster'})
    }
};