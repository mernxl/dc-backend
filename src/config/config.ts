import { loadConfig, NODE_ENV } from '@xelgrp/configu';

import packageJson from '../../package.json';
import { CloxelConfig } from './cloxel';

export interface AppConfiguration {
  API_BASE_PATH: string;
  APP_SERVING_URL: string;
  NODE_ENV: NODE_ENV;
  REVERSE_PROXY: boolean;
  SERVER_PORT: number;
  MONGODB_USE_IN_MEMORY_DB: boolean;
  cloxel: CloxelConfig;
  app: {
    name: string;
    version: string;
  };
  mongodb: {
    user?: string;
    pass?: string;
    uri?: string;
    port: number;
    host: string;
    defaultMn: string; // default module name
    defaultDb: string; // default db to connect to
  };
}

const getConfig = (): AppConfiguration =>
  loadConfig<AppConfiguration>('app.ini', {
    API_BASE_PATH: '',
    app: {
      name: packageJson.name,
      version: packageJson.version,
    },
    mongodb: {
      port: 27017,
      host: 'localhost',
      defaultDb: packageJson.name,
      defaultMn: packageJson.name,
    },
  });

const config = getConfig();

export { config, getConfig };
