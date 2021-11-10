const knex = require('knex')

const configs = require('../knexfile.js')

const env = process.env.NODE_ENV || 'development'

module.exports = knex(configs[env])
