import { Context, HttpRequest } from '@azure/functions';
import { beforeEach, describe, expect, test } from '@jest/globals';
import * as databaseClient from '../shared/db-connection-cache';
import { DbConnection } from '../shared/db-connection-cache';
import httpTrigger from './index';

describe('Status', () => {
  let context: Context;
  let request: HttpRequest;

  beforeEach(() => {
    // Really crude and unsafe implementations that will be replaced soon
    context = { log: () => {} } as unknown as Context;
    request = { query: {} } as unknown as HttpRequest;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('with secret ok', async () => {
    const secret = 'secret';

    const fakeDbConnection: DbConnection = {
      client: undefined, //ignored for this test
      isConnected: true
    };

    const spyDbData = jest
      .spyOn(databaseClient, 'getDbConnection')
      .mockResolvedValue(fakeDbConnection);

    process.env.STATUS_SECRET = secret;
    process.env.AZURE_COSMOSDB_CONNECTION_STRING =
      'mongodb://cosmosdb-gh:5jM==@cosmosdb-gh.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cosmosdb-gh@';
    process.env.DB_DISCONNECT = 'false';

    request.query.secret = secret;
    request.query.test = 'with secret ok';
    await httpTrigger(context, request);

    console.log(context.res.body);
    expect(context.res.status).toEqual(200);
    expect(context.res.body.hasOwnProperty('version')).toBe(true);
    expect(context.res.body.hasOwnProperty('env')).toBe(true);
    expect(context.res.body.hasOwnProperty('headers')).toBe(true);
    expect(context.res.body.hasOwnProperty('dbIsConnected')).toBe(true);

    spyDbData.mockReset();
  });

  test('w secret not ok', async () => {
    process.env.STATUS_SECRET = 'secret';
    process.env.AZURE_COSMOSDB_CONNECTION_STRING =
      process.env.AZURE_COSMOSDB_CONNECTION_STRING;
    process.env.DB_DISCONNECT = 'true';
    request.query.secret = '';
    await expect(httpTrigger(context, request));
    expect(context.res.status).toEqual(401);
  });

  test('w/o secret', async () => {
    process.env.STATUS_SECRET = '';
    process.env.AZURE_COSMOSDB_CONNECTION_STRING =
      process.env.AZURE_COSMOSDB_CONNECTION_STRING;
    process.env.DB_DISCONNECT = 'true';
    await expect(httpTrigger(context, request));
    expect(context.res.status).toEqual(500);
  });
});
