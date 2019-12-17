
exports.seed = function(knex) {
  // Deletes ALL existing entries
  // return knex('users').truncate()
  //   .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {username: 'alberto', password: 'pass', role_id: 3},
        {username: 'anthony', password: 'pass', role_id: 3},
        {username: 'michael', password: 'pass', role_id: 3}
      ]);
  //  });
};
