import { RedisClientType, createClient } from 'redis';
import { Production } from './types';

export class RedisCacheClient {
  private _client: RedisClientType;
  constructor(
    username: string = 'default',
    password: string | undefined = undefined,
    host: string = 'localhost',
    port: number = 6379
  ) {
    this._client = createClient({
      username,
      password,
      socket: {
        host,
        port,
      },
    });
    this._client.connect();
    this._client.on('error', err => {
      console.error('Redis error: ' + err);
    });
  }

  setSearchResult(id: number, result: Production[]) {
    this._client.hSet(id.toString(), '$', JSON.stringify(result));
  }

  async getSearchResult(id: number): Promise<Production[]> {
    const result = await this._client.hGet(id.toString(), '$');
    return result ? JSON.parse(result) : [];
  }
}
