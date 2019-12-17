exports.up = function(knex) {
  return knex.schema.createTable('users', users => {
    users.increments();

    users
      .string('username', 128)
      .notNullable()
      .unique();
    users.string('password', 128).notNullable()

    users
      .integer("role_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("roles ")
      .onUpdate('CASCADE')
      .onDelete('RESTRICT')
 
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
// file not needed anymore it was added to users
//this was in another migration file that was deleted because of sqlite3


// exports.up = function(knex) {
//   return knex.schema.table("users", tbl => {
//     tbl
//       .integer("role_id")
//       .unsigned()
//       .notNullable()
//       .references("id")
//       .inTable("roles")
//       .onUpdate('CASCADE')
//       .onDelete('RESTRICT')
//   });
// };

// exports.down = function(knex) {
//     return knex.schema.table('users', tbl => {
//         tbl.dropColumn('role_id')
//     })
// };
