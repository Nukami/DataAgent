import { Config, loadConfig } from './config';
import { Database, Production } from './db';
import { RedisCacheClient } from './db/redis-cache-client';

export class GlobalStorage {
  private static _instance?: GlobalStorage;
  private _config: Config;
  private _database: Database | undefined;
  private _searchResult: Record<number, Production[]> = {};
  private _redisCacheClient: RedisCacheClient;

  private constructor() {
    this._config = loadConfig();
    const redisConfig = this._config.redis;
    this._redisCacheClient = new RedisCacheClient(
      redisConfig.username,
      redisConfig.password,
      redisConfig.host,
      redisConfig.port
    );
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
    // this._searchResult[id] = result;
    this._redisCacheClient.setSearchResult(id, result);
  }

  async getSearchResult(id: number): Promise<Production[]> {
    return this._redisCacheClient.getSearchResult(id);
    // return this._searchResult[id] ?? [];
  }
}
