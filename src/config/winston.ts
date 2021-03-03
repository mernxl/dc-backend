import { NODE_ENV } from '@xelgrp/configu';
import * as winston from 'winston';

import { config as envConfig } from './config';

const config = (end: string) => ({
  fileError: {
    level: 'error',
    filename: `${process.cwd()}/logs/${end}-error.log`,
    handleExceptions: true,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    maxsize: 5242880, // 5MB
    maxFiles: 20,
  },
  fileCombined: {
    level: 'info',
    filename: `${process.cwd()}/logs/${end}-combined.log`,
    handleExceptions: true,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    maxsize: 5242880, // 5MB
    maxFiles: 20,
  },
  consoleLogs: {
    level: 'trace',
    handleExceptions: true,
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  },
});

// make compatible with https://github.com/trentm/node-bunyan#levels levels, for use in nodemailer
const logLevels = { fatal: 0, error: 1, warn: 2, info: 3, verbose: 4, debug: 5, trace: 6 };

// idea: Use winston as a logger to create files, then we get kafka to tail the log for events
const logger = winston.createLogger({
  levels: logLevels,
  transports: [
    new winston.transports.File(config('back').fileError),
    new winston.transports.File(config('back').fileCombined),
  ],
  exitOnError: false,
});

// register a console logger, no console logger if not development and not behind reverse proxy
if (!envConfig.REVERSE_PROXY && envConfig.NODE_ENV === NODE_ENV.DEVELOPMENT) {
  logger.add(new winston.transports.Console(config('back').consoleLogs));
}

// stream for morgan
const mLoggerStream = {
  write(message: unknown): any {
    logger.info(message);
  },
};

export { mLoggerStream, logger as wLogger };
