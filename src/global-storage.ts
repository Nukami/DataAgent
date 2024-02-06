import { Config, loadConfig } from './config';
import { Database, Production } from './db';

export class GlobalStorage {
  private static _instance?: GlobalStorage;
  private _config: Config;
  private _database: Database | undefined;
  private _searchResult: Record<number, Production[]> = {};

  private constructor() {
    this._config = loadConfig();
  }

  getConfig(): Config {
    return this._config;
  }

  getProxyUrl(): string {
    return this._config.proxy.url;
  }

  public static getInstance() {
    if (!GlobalStorage._instance) {
      GlobalStorage._instance = new GlobalStorage();
    }
    return GlobalStorage._instance;
  }

  getDatabase(): Database {
    this._database ??= new Database(this._config.db.path);
    return this._database;
  }

  setSearchResult(id: number, result: Production[]) {
    this._searchResult[id] = result;
  }

  getSearchResult(id: number): Production[] {
    return this._searchResult[id] ?? [];
  }
}
