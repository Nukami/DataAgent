import { parse } from 'yaml';
import { readFileSync } from 'fs';

export interface Config {
  auth: {
    client_id: string;
    token: string;
  };
  proxy: {
    url: string;
    enable: boolean;
  };
  db: {
    path: string;
  };
  redis: {
    host?: string;
    port?: number;
    db?: string;
    username?: string;
    password?: string;
  };
}

export function loadConfig(): Config {
  const content = readFileSync('config.yaml', 'utf8');
  const config = parse(content);
  return config;
}
