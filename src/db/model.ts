import { Statement } from 'better-sqlite3'

export interface ModelStatic {
  createTableSQL: string
  sqlSpec: ISQLSpec
  new(...args: any[])
}

export class Model {
  /**
   * SQL Spec on the instance is a copy as the static version
   * enriched with the actual values for columns and keys
   */
  get sqlSpec(): ISQLSpec {
    const { table, columns, keys } = (this.constructor as ModelStatic).sqlSpec
    // Dig values for the columns
    Object.entries(columns).forEach(([key, value]): void => { columns[key] = this[value] })
    // Dig values for the keys
    Object.entries(keys).forEach(([key, value]): void => { keys[key] = this[value]})
    return {
      table,
      columns,
      keys,
    }
  }

  get _columns(): string {
    return Object.keys(this.sqlSpec.columns).map(
      (key, value = this.sqlSpec.columns[key]): string => typeof value == 'number'
        ? this._mapNumber(key, value)
        : this._mapString(key, value)
    ).join(',\n       ')
  }
  
  get _keys(): string {
    return Object.keys(this.sqlSpec.keys).map(
      (key, value = this.sqlSpec.keys[key]): string => typeof value == 'number'
        ? this._mapNumber(key, value)
        : this._mapString(key, value)
    ).join(' AND\n        ')
  }
  
  _mapNumber(key: string, value: number): string {
    return `'${key}' = ${value}`
  }

  _mapString(key: string, value: string): string {
    return `'${key}' = "${value}"`
  }

  save(): void {
    const { table } = this.sqlSpec

    const query: string = `
      UPDATE '${table}'
      SET 
        ${this._columns}
      WHERE
        ${this._keys}
      ;
    `
  }

  static getOneByPk(...args: number[]|string[]): any {
    const { table, columns, keys } = (this as any).sqlSpec

    return new this()
  }
}

export interface ISQLSpec {
  table: string
  columns: object
  keys: object
}