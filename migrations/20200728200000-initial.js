module.exports = {
  async up(knex) {
    await knex.schema.createTable('chunk', table => {
      table.integer('x')
      table.integer('y')
      table.integer('visits')
      table.index(['x', 'y'])
      table.primary(['x', 'y'])
    })
    await knex.schema.createTable('cell', table => {
      table.integer('x')
      table.integer('y')
      table.string('content')
      table.integer('chunkId')
        .references('id').inTable('chunk')
        .onDelete('CASCADE')
        .index()
      table.index(['x', 'y'])
      table.primary(['x', 'y'])
    })
  },
  async down(knex) {
    await knex.schema.dropTable('chunk')
    await knex.schema.dropTable('cell')
  }
}