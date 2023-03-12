import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { findOrgReposInMongoDbWithProjection } from '../shared/azure-cosmosdb-data-to-mongodb';
import { getDbConnection } from '../shared/db-connection-cache';
import {
  FunctionEnvVarParam,
  FunctionEnvVarResult,
  getEnvVars
} from '../shared/env';

const functionEnvVariables: FunctionEnvVarParam[] = [
  { name: 'AZURE_COSMOSDB_CONNECTION_STRING', required: true, type: 'string' },
  { name: 'AZURE_COSMOSDB_DATABASE_NAME', required: true, type: 'string' },
  { name: 'AZURE_COSMOSDB_COLLECTION_NAME', required: true, type: 'string' }
];

/**
 * Request last set of org repos data by datetime
 * @param context
 * @param req
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  _: HttpRequest
): Promise<void> {
  try {
    context.log('HTTP trigger org function processed a request.');

    const env: FunctionEnvVarResult = getEnvVars(
      functionEnvVariables,
      context.log
    );

    const { isConnected, client } = await getDbConnection(
      env.AZURE_COSMOSDB_CONNECTION_STRING as string,
      context.log
    );
    context.log('isConnected: ', isConnected);

    const list = await findOrgReposInMongoDbWithProjection(
      client,
      env.AZURE_COSMOSDB_DATABASE_NAME as string,
      env.AZURE_COSMOSDB_COLLECTION_NAME as string
    );

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: list
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
