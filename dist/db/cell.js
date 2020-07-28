"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = void 0;
exports.Cell = class CellConstructor {
    static getTableSQL() {
        return `
      CREATE TABLE IF NOT EXISTS cell (
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        content TEXT,
        PRIMARY KEY (x, y)
      );

      CREATE INDEX idx_cell_x ON cell (x);
      CREATE INDEX idx_cell_y ON cell (y);
    `;
    }
};
