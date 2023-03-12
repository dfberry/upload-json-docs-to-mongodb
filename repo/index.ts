import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { findRepoInMongoDbWithProjection } from '../shared/azure-cosmosdb-data-to-mongodb';
import { getDbConnection } from '../shared/db-connection-cache';

import {
  FunctionEnvVarParam,
  FunctionEnvVarResult,
  getEnvVars
} from '../shared/env';

const functionEnvVariables: FunctionEnvVarParam[] = [
  { name: 'AZURE_COSMOSDB_CONNECTION_STRING', required: true, type: 'string' },
  { name: 'AZURE_COSMOSDB_DATABASE_NAME', required: true, type: 'string' },
  { name: 'AZURE_COSMOSDB_COLLECTION_NAME', required: true, type: 'string' },
  { name: 'AZURE_STORAGE_NAME', required: true, type: 'string' },
  { name: 'AZURE_STORAGE_KEY', required: true, type: 'string' },
  { name: 'DB_DISCONNECT', required: false, type: 'boolean' }
];

/**
 * Get repo data by name
 * @param context
 * @param req
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    context.log('HTTP trigger repo function processed a request.');

    const repoName = req.query.name || (req.body && req.body.name);
    if (!repoName) throw Error('No repo name provided');

    const env: FunctionEnvVarResult = getEnvVars(
      functionEnvVariables,
      context.log
    );

    const { isConnected, client } = await getDbConnection(
      env.AZURE_COSMOSDB_CONNECTION_STRING as string,
      context.log
    );

    context.log('isConnected: ', isConnected);

    const result = await findRepoInMongoDbWithProjection(
      client,
      env.AZURE_COSMOSDB_DATABASE_NAME as string,
      env.AZURE_COSMOSDB_COLLECTION_NAME as string,
      repoName
    );

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: result
    };
    // Close the connection to the database if the DB_DISCONNECT environment variable is set to true
    if (process?.env.DB_DISCONNECT === 'true' && isConnected) {
      await client.close();
    }
  } catch (error: unknown) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default httpTrigger;
