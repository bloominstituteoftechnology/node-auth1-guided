const knex = require('knex');
const knexConfig = require('../knexfile.js');
const db = knex(knexConfig.development);

function insertUser(user) {
    return db('users').insert(user);
}

function findByUsername(username) {
    return db('users').where('username', username);
}

function findUsers() {
    return db('users').select('id', 'username');
}

function findUserById(id) {
     return db('users').where({id}).first();
}
module.exports = {
   insertUser, findByUsername, findUsers, findUserById
}
