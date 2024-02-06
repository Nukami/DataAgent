import { parse } from 'yaml';
import { readFileSync } from 'fs';

export type Config = {
  auth: {
    client_id: string;
    token: string;
  };
  proxy: {
    url: string;
  };
  db: {
    path: string;
  };
};

export function loadConfig(): Config {
  const content = readFileSync('config.yaml', 'utf8');
  const config = parse(content);
  return config;
}
