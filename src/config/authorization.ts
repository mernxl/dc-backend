import express from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { ErrorResponse } from '../utils';
import { wLogger } from './winston';

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<void> {
  if (securityName === 'Bearer') {
    const rawToken = String(request.get('authorization') || '');

    try {
      if (rawToken !== 'hi') {
        (() => {
          // hihi bypass local thrown error caught stuff lol
          throw new ErrorResponse(ReasonPhrases.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
        })();
      }
    } catch (e) {
      wLogger.error(e);

      throw new ErrorResponse(ReasonPhrases.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
    }
  }
}
