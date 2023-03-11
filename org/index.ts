import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { findOrgReposInMongoDbWithProjection } from '../shared/azure-cosmosdb-data-to-mongodb';
import { getDbConnection } from '../shared/db-connection-cache';

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

    const list = await findOrgReposInMongoDbWithProjection(
      client,
      databaseName,
      collectionName
    );

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: list
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
