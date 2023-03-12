import { describe, expect, test } from '@jest/globals';
import { FunctionEnvVarParam, getEnvVars } from './env';
import * as Config from './config';

describe('env', () => {
  let processEnvBackup: NodeJS.ProcessEnv;

  beforeEach(() => {
    processEnvBackup = process.env;
  });
  afterEach(() => {
    process.env = processEnvBackup;
    jest.restoreAllMocks();
  });

  test('env success', async () => {
    const keyValue = '123';
    const keyName = 'STATUS_SECRET';
    const keyNameNotFound = 'AZURE_COSMOSDB_CONNECTION_STRING';

    const fakeEnvVars = {
      AZURE_COSMOSDB_CONNECTION_STRING: 'abc',
      GITHUB_PERSONAL_ACCESS_TOKEN_DISPATCH: 'abc',
      AZURE_COSMOSDB_DATABASE_NAME: 'abc',
      AZURE_COSMOSDB_COLLECTION_NAME: 'abc',
      DB_DISCONNECT: 'false',
      AZURE_STORAGE_NAME: 'abc',
      AZURE_STORAGE_KEY: 'abc',
      GITHUB_OWNER: 'abc',
      STATUS_SECRET: keyValue
    };

    const spyEnv = jest
      .spyOn(Config, 'getConfigKeys')
      .mockImplementation(() => {
        //console.log('mocked getConfigKeys');
        return fakeEnvVars;
      });

    const functionEnvVariables: FunctionEnvVarParam[] = [
      { name: keyName, required: true, type: 'string' }
    ];

    const fakeLogger = jest.fn();

    // Get only env vars the function needs, nothing more
    const envVars = getEnvVars(functionEnvVariables, fakeLogger);

    expect(envVars).toBeDefined();
    expect(Object.keys(envVars).length).toEqual(functionEnvVariables.length);
    expect(envVars).toHaveProperty(keyName);
    expect(envVars[keyName]).toEqual(keyValue);
    expect(envVars).not.toHaveProperty(keyNameNotFound);
    spyEnv.mockReset();
  });
});
