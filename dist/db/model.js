"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
class Model {
    /**
     * SQL Spec on the instance is a copy as the static version
     * enriched with the actual values for columns and keys
     */
    get sqlSpec() {
        const { table, columns, keys } = this.constructor.sqlSpec;
        // Dig values for the columns
        Object.entries(columns).forEach(([key, value]) => { columns[key] = this[value]; });
        // Dig values for the keys
        Object.entries(keys).forEach(([key, value]) => { keys[key] = this[value]; });
        return {
            table,
            columns,
            keys,
        };
    }
    get _columns() {
        return Object.keys(this.sqlSpec.columns).map((key, value = this.sqlSpec.columns[key]) => typeof value == 'number'
            ? this._mapNumber(key, value)
            : this._mapString(key, value)).join(',\n       ');
    }
    get _keys() {
        return Object.keys(this.sqlSpec.keys).map((key, value = this.sqlSpec.keys[key]) => typeof value == 'number'
            ? this._mapNumber(key, value)
            : this._mapString(key, value)).join(' AND\n        ');
    }
    _mapNumber(key, value) {
        return `'${key}' = ${value}`;
    }
    _mapString(key, value) {
        return `'${key}' = "${value}"`;
    }
    save() {
        const { table } = this.sqlSpec;
        const query = `
      UPDATE '${table}'
      SET 
        ${this._columns}
      WHERE
        ${this._keys}
      ;
    `;
    }
    static getOneByPk(...args) {
        const { table, columns, keys } = this.sqlSpec;
        return new this();
    }
}
exports.Model = Model;
