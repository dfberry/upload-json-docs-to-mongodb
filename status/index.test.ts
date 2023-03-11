import { Context, HttpRequest } from '@azure/functions';
import { beforeEach, describe, expect, test } from '@jest/globals';
import { version } from '../package.json';
import * as databaseClient from '../shared/db-connection-cache';
import { DbConnection } from '../shared/db-connection-cache';
import * as mockEnvironmentVariables from '../shared/env';
import { FunctionEnvVarResult } from '../shared/env';
import httpTrigger from './index';

describe('Status', () => {
  let context: Context;
  let request: HttpRequest;
  let processEnvBackup: NodeJS.ProcessEnv;
  const secret = 'secret';

  beforeEach(() => {
    // Really crude and unsafe implementations that will be replaced soon
    context = {
      log: (_: string) => {
        return;
      }
    } as unknown as Context;
    request = { query: {} } as unknown as HttpRequest;
    processEnvBackup = process.env;
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    process.env = processEnvBackup;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('with secrets matching', async () => {
    const fakeDbConnection: DbConnection = {
      client: undefined, //ignored for this test
      isConnected: true
    };
    const fakeEnvVars: FunctionEnvVarResult = {
      STATUS_SECRET: secret,
      AZURE_COSMOSDB_CONNECTION_STRING:
        'mongodb://cosmosdb-gh:5jM==@cosmosdb-gh.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cosmosdb-gh@',
      DB_DISCONNECT: false
    };
    const spyDbData = jest
      .spyOn(databaseClient, 'getDbConnection')
      .mockResolvedValue(fakeDbConnection);

    const spyEnv = jest
      .spyOn(mockEnvironmentVariables, 'getEnvVars')
      .mockReturnValue(fakeEnvVars);
    request.query.secret = secret;
    request.query.test = 'with secret ok';
    await httpTrigger(context, request);

    expect(context.res.status).toEqual(200);

    expect(
      Object.prototype.hasOwnProperty.call(context.res.body, 'version')
    ).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(context.res.body, 'env')).toBe(
      true
    );
    expect(
      Object.prototype.hasOwnProperty.call(context.res.body, 'headers')
    ).toBe(true);
    expect(
      Object.prototype.hasOwnProperty.call(context.res.body, 'dbIsConnected')
    ).toBe(true);

    spyDbData.mockReset();
    spyEnv.mockReset();
  });

  test("w secret in request doesn't match env secret", async () => {
    const fakeDbConnection: DbConnection = {
      client: undefined, //ignored for this test
      isConnected: true
    };
    const fakeEnvVars: FunctionEnvVarResult = {
      STATUS_SECRET: secret,
      AZURE_COSMOSDB_CONNECTION_STRING:
        'mongodb://cosmosdb-gh:5jM==@cosmosdb-gh.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cosmosdb-gh@',
      DB_DISCONNECT: false
    };
    const spyDbData = jest
      .spyOn(databaseClient, 'getDbConnection')
      .mockResolvedValue(fakeDbConnection);

    const spyEnv = jest
      .spyOn(mockEnvironmentVariables, 'getEnvVars')
      .mockReturnValue(fakeEnvVars);

    request.query.secret = 'not the secret';
    request.query.test = 'with secret ok';

    await expect(httpTrigger(context, request));
    expect(context.res?.status).toEqual(401);
    expect(context.res?.body?.message).toEqual(
      'Unauthorized - status secret is missing or incorrect'
    );

    spyDbData.mockReset();
    spyEnv.mockReset();
  });
  // should return public information such as version
  test('w/o secret in request', async () => {
    const fakeDbConnection: DbConnection = {
      client: undefined, //ignored for this test
      isConnected: true
    };
    const fakeEnvVars: FunctionEnvVarResult = {
      STATUS_SECRET: secret,
      AZURE_COSMOSDB_CONNECTION_STRING:
        'mongodb://cosmosdb-gh:5jM==@cosmosdb-gh.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cosmosdb-gh@',
      DB_DISCONNECT: false
    };

    const spyDbData = jest
      .spyOn(databaseClient, 'getDbConnection')
      .mockResolvedValue(fakeDbConnection);

    const spyEnv = jest
      .spyOn(mockEnvironmentVariables, 'getEnvVars')
      .mockReturnValue(fakeEnvVars);

    // no secret in request
    //request.query.secret = undefined;
    request.query['test'] = 'w/o secret in request';

    // doesn't have secret so should just return bare minimum
    await expect(httpTrigger(context, request));

    expect(context.res.status).toEqual(200);
    expect(context.res.body.version).toEqual(version);

    spyDbData.mockReset();
    spyEnv.mockReset();
  });
});
