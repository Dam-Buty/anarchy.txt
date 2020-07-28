import { Database } from 'better-sqlite3'
import { Model, ModelStatic, ISQLSpec } from './model'

export const Chunk: ModelStatic = class extends Model {
  /* coordinates */
  readonly x: number
  readonly y: number
  readonly top: number
  readonly bottom: number
  readonly left: number
  readonly right: number
  /* chunk data */
  readonly seed: string
  visits: number
  /* tech */
  readonly db: Database

  constructor(x: number, y: number, seed: string) {
    super()
    this.x = x
    this.y = y
  }

  static get sqlSpec(): ISQLSpec {
    return {
      table: 'chunk',
      columns: {
        visits: 'visits',
      },
      keys: {
        x: 'x',
        y: 'y',
      }
    }
  }

  static get createTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS chunk (
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        visits INTEGER NOT NULL,
        PRIMARY KEY (x, y)
      );

      CREATE INDEX idx_chunk_x ON chunk (x);
      CREATE INDEX idx_chunk_y ON chunk (y);
    `
  }
}