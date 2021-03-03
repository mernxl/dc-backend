import { Controller, Get, Route, Security, Tags } from 'tsoa';

import packageJson from '../../../package.json';

@Tags('Health Check')
@Route('health-check')
export class HealthCheckController extends Controller {
  @Get()
  async index(): Promise<string> {
    return 'Hello ' + packageJson.name + ' App.';
  }

  /**
   * To test, pass "Bearer root" as token
   * @summary This endpoint is secured, Login and use the authentication to go through
   */
  @Get('/secured')
  @Security('Bearer')
  async secured(): Promise<string> {
    return 'Hello, secured endpoint on ' + packageJson.name + ' App.';
  }
}
