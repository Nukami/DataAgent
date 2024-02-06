import * as excel from 'exceljs';
import path from 'path';
import * as glob from 'glob';
import { executeFilter, getProductionFromExcelRow, isValidExcelFile } from './helper';
import { Production, Condiction } from './types';

export class Database {
  dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = path.resolve(dataDir);
  }

  productions: { [key: string]: Production[] } = {};

  clear() {
    this.productions = {};
  }

  async loadAll() {
    const files = glob.sync('**/*.xlsx', { cwd: this.dataDir });
    for (const file of files) {
      const filePath = path.resolve(this.dataDir, file);
      await this.load(filePath);
    }
  }

  async reloadAll() {
    this.clear();
    await this.loadAll();
  }

  async load(path: string): Promise<Production[]> {
    const workbook = new excel.Workbook();
    const wb = await workbook.xlsx.readFile(path);
    if (!isValidExcelFile(wb)) {
      throw new Error('Invalid excel file');
    }
    const sheet = wb.getWorksheet(1);
    if (!sheet) throw new Error('Invalid excel file');
    const productions: Production[] = [];
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const production: Production = getProductionFromExcelRow(row);
      if (production.itemNumber) {
        productions.push(production);
      }
    }
    this.productions[path] = productions;
    return productions;
  }

  filter(conditions: Condiction[]): Production[] {
    const result: Production[] = [];
    Object.keys(this.productions).forEach(key => {
      const filtered = this.productions[key].filter(production => {
        for (const condition of conditions) {
          if (!executeFilter(production, condition)) return false;
        }
        return true;
      });
      result.push(...filtered);
    });
    return result;
  }

  getItemsAmount(): number {
    let result = 0;
    Object.keys(this.productions).forEach(key => {
      result += this.productions[key].length;
    });
    return result;
  }
}
