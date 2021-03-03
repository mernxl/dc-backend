import { StatusCodes } from 'http-status-codes';

export interface IErrorResponse<T = string> {
  status: number;
  message: string;
  details: ValidationFieldErrors<T>;
}

/**
 * General Error Object, gets other props from Error which include
 *
 * name, message, stack
 */
export class ErrorResponse extends Error {
  constructor(
    public message = 'Internal Server Error',
    public status = StatusCodes.INTERNAL_SERVER_ERROR,
    public details?: ValidationFieldErrors<string> | unknown,
  ) {
    super(message);
    this.status = status || this.status;
  }
}

export type ValidationFieldErrors<T> = {
  [K in keyof T]?: string | ValidationFieldErrors<any>;
};

export class ValidationError<T> extends ErrorResponse {
  constructor(public fields: ValidationFieldErrors<T>, message = 'Input Validation Error') {
    super(message, StatusCodes.BAD_REQUEST, fields);
  }
}

/**
 * Since null is not allowed on OpenAPI, use this to represent null values on Spec
 */
export type NullValue = null;

export function enumObjectValues(enumObject: Record<string, any>): string[] {
  const valueArray: string[] = [];
  if (!enumObject) {
    return valueArray;
  }

  for (const key in enumObject) {
    valueArray.push(enumObject[key]);
  }

  return valueArray;
}
