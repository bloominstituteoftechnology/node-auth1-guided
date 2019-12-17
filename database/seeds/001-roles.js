exports.seed = function(knex) {
  // Deletes ALL existing entries
  // return knex("roles")
  //   .truncate()
  //   .then(function() {
      // Inserts seed entries
      return knex("roles").insert([
        { name: "admin" }, //id:1
        { name: "TLs" }, //id:2
        { name: "students" } //id:3
      ]);
   // });
};
