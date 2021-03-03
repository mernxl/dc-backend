import { NODE_ENV } from '@xelgrp/configu';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import mLogger from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from '../routes/routes';
import swaggerSchema from '../routes/swagger.json';
import { config } from './config';
import { mLoggerStream, wLogger } from './winston';

const app: Express = express();

// morgan traffic logger
app.use(
  mLogger<express.Request>(config.NODE_ENV === NODE_ENV.PRODUCTION ? 'combined' : 'dev', {
    stream: mLoggerStream,
  }),
);

// Add helmet securities
app.use(helmet({ contentSecurityPolicy: false }));

// enable CORS - Cross Origin Resource Sharing
app.use(cors<express.Request>());

// enable gzip, deflate compressions
// avoid reverse Proxy errors on gzip-ing
if (!config.REVERSE_PROXY) {
  app.use(compression());
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

// register all our routes on basePath
const routesApp = express();
RegisterRoutes(routesApp);
app.use(config.API_BASE_PATH, routesApp);

app.use(
  `${config.API_BASE_PATH}/docs`,
  (req: any, res: any, next: () => any) => {
    if (swaggerSchema.servers.length === 1) {
      swaggerSchema.servers = [
        { url: `http://${req.get('host')}${config.API_BASE_PATH}` },
        { url: `https://${req.get('host')}${config.API_BASE_PATH}` },
      ];

      if (config.REVERSE_PROXY) {
        // Avoid issues like failed to fetch errors when using http, due to Content-Security headers
        swaggerSchema.servers = swaggerSchema.servers.reverse();
      }
    }

    req.swaggerDoc = swaggerSchema;
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(),
);

// catch 404 and forward to error handler
app.use((req: Request, res: Response) => {
  const err = { status: 404, message: 'Resource Not Found' };

  wLogger.warn(`${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} `);

  res.locals = { ...res.locals, ...err, error: err };
  res.status(err.status);
  res.send(err.message);
});

// error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  if (res.headersSent) {
    return next(err);
  }

  const locals = {
    name: err.name,
    message: err.message,
    details: err.details,
  };
  // res.locals.stack = req.app.get('env') === 'development' ? err.stack : undefined;

  if ('fields' in err) {
    const details: Record<string, any> = {};

    for (const key in err.fields) {
      // lets remove the body. when validating body
      if (key.startsWith('body.')) {
        details[key.substr(5)] = err.fields[key];
      } else {
        details[key] = err.fields[key];
      }
    }

    if (config.NODE_ENV === NODE_ENV.PRODUCTION) {
      delete err.fields;
    }

    locals.details = details;
  }

  // add this line to include winston logging
  wLogger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} `,
    err,
  );

  // render the error page
  res.status(err.status || 500);
  res.json(locals);
});

export { app };
