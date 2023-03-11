import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { processBlobUrl } from '../shared/integration';
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
 *
 * @param context Given a blob url, insert the data into the database
 * @param req
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('insert HTTP trigger function processed a request.');

  try {
    const env: FunctionEnvVarResult = getEnvVars(functionEnvVariables);

    const blobUrl = req.query.url || (req.body && req.body.url);
    if (!blobUrl) throw Error('Missing blobUrl');

    // this can come in from the body or the environment variables
    // b/c this is fixing when the GitHub Action -> Blob Storage -> MongoDB fails
    const databaseName =
      req.body.databaseName || env.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName =
      req.body.collectionName || env.AZURE_COSMOSDB_COLLECTION_NAME;

    const { isConnected, client } = await getDbConnection(
      env.AZURE_COSMOSDB_CONNECTION_STRING as string,
      context.log
    );
    context.log('isConnected: ', isConnected);

    if (blobUrl) {
      const result = await processBlobUrl({
        blobUrl,
        client,
        databaseName,
        collectionName,
        storageName: env.AZURE_STORAGE_NAME,
        storageKey: env.AZURE_STORAGE_KEY,
        log: context.log
      });
      context.res = {
        // status: 200, /* Defaults to 200 */
        body: result
      };
    }

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: null
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
