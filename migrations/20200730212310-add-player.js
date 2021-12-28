module.exports = {
  async up(knex) {
    await knex.schema.createTable('player', table => {
      table.string('name').unique()
      table.integer('currentX')
      table.integer('currentY')
      table.index(['name', 'currentX', 'currentY'])
      table.primary(['name'])
    })
    await knex.schema.table('cell', table => {
      table.string('owner')
        .references('name').inTable('player')
        .onDelete('SET NULL')
        .index()
    })
  },
  async down(knex) {
    await knex.schema.dropTable('player')
    await knex.table('cell', table => table.dropColumn('owner'))
  }
}