import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { findSummaryInMongoDb } from '../shared/azure-cosmosdb-data-to-mongodb';
import { getDbConnection } from '../shared/db-connection-cache';

const httpTrigger: AzureFunction = async function (
  context: Context,
  _: HttpRequest
): Promise<void> {
  try {
    context.log('HTTP trigger summary function processed a request.');

    const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;
    const databaseName = process.env.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName = process.env.AZURE_COSMOSDB_COLLECTION_NAME;

    if (!connectionString)
      throw new Error('environment AZURE_COSMOSDB_CONNECTION_STRING missing ');
    if (!databaseName)
      throw new Error('environment AZURE_COSMOSDB_DATABASE_NAME missing ');
    if (!collectionName)
      throw new Error('environment AZURE_COSMOSDB_COLLECTION_NAME missing ');

    const { isConnected, client } = await getDbConnection(
      connectionString,
      context.log
    );
    context.log('isConnected: ', isConnected);

    const result = await findSummaryInMongoDb(
      client,
      databaseName,
      collectionName + '-count'
    );

    // Close the connection to the database if the DB_DISCONNECT environment variable is set to true
    if (process.env.DB_DISCONNECT === 'true' && isConnected) {
      await client.close();
    }

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: result
    };
  } catch (error: unknown) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default httpTrigger;
