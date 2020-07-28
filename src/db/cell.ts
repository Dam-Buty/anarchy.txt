import { Database } from 'better-sqlite3'
import { Model, ModelStatic } from './model'

export const Cell: ModelStatic = class CellConstructor implements Model {
  x: number
  y: number
  content: string
  /* tech */
  db: Database

  static getTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS cell (
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        content TEXT,
        PRIMARY KEY (x, y)
      );

      CREATE INDEX idx_cell_x ON cell (x);
      CREATE INDEX idx_cell_y ON cell (y);
    `
  }
}