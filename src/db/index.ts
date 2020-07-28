import DatabaseConstructor, { Database, Statement } from 'better-sqlite3'

import { Chunk } from './chunk'
import { Cell } from './cell'

export const db: Database = new DatabaseConstructor('database.db');

[Chunk, Cell].forEach((model: any): void => {
  const query: string = model.getTableSql()
  const stmt: Statement = db.prepare(query)
  stmt.run()
})
