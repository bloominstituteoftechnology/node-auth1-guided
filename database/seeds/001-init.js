exports.seed = function (knex) {
  // 000-cleanup.js already truncated tables
  return knex("users")
    .insert({
      username: 'admin',
      password: '$2a$08$CjOzAqkUXePlNyZCG6TKuubIY.MpjKqOdrV/W3178ah483kyEbeSe', // plain text password is 1234
    })
}
