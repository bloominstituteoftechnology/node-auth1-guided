const path = require('path')
const express = require('express');
const helmet = require('helmet');

const usersRouter = require('./users/users-router.js');

const server = express();

server.use(express.static(path.join(__dirname, '../client')));
server.use(helmet());
server.use(express.json());

server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

server.use('*', (req, res) => {
  res.status(404).json({ message: 'not found!' })
});

module.exports = server;
