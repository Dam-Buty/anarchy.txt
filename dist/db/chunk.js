"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chunk = void 0;
const model_1 = require("./model");
exports.Chunk = class extends model_1.Model {
    constructor(x, y, seed) {
        super();
        this.x = x;
        this.y = y;
    }
    static get sqlSpec() {
        return {
            table: 'chunk',
            columns: {
                visits: 'visits',
            },
            keys: {
                x: 'x',
                y: 'y',
            }
        };
    }
    static get createTableSQL() {
        return `
      CREATE TABLE IF NOT EXISTS chunk (
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        visits INTEGER NOT NULL,
        PRIMARY KEY (x, y)
      );

      CREATE INDEX idx_chunk_x ON chunk (x);
      CREATE INDEX idx_chunk_y ON chunk (y);
    `;
    }
};
