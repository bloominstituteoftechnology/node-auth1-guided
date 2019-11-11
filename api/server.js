const express = require('express');

const apiRouter = require('./api-router.js');
const configureMiddleware = require('./configure-middleware')
const server = express();

server.use('/api', apiRouter);

module.exports = server;
