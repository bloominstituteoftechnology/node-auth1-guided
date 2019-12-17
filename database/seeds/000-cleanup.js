
exports.seed = function(knex) {
  return clearInterval.clean(knex,{
    mode: 'truncate',
    ignoreTables: ['knex_migrations', 'knex_migrations_lock']
  });
};
