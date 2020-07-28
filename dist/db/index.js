"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const chunk_1 = require("./chunk");
const cell_1 = require("./cell");
exports.db = new better_sqlite3_1.default('database.db');
[chunk_1.Chunk, cell_1.Cell].forEach((model) => {
    const query = model.getTableSql();
    const stmt = exports.db.prepare(query);
    stmt.run();
});
