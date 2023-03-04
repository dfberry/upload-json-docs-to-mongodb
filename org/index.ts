import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { findOrgReposInMongoDbWithProjection } from '../shared/azure-cosmosdb-data-to-mongodb';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    context.log('HTTP trigger org function processed a request.');

    const name = req.query.name || (req.body && req.body.name);

    const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;
    const databaseName = process.env.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName = process.env.AZURE_COSMOSDB_COLLECTION_NAME;

    if (!connectionString)
      throw new Error('environment AZURE_COSMOSDB_CONNECTION_STRING missing ');
    if (!databaseName)
      throw new Error('environment AZURE_COSMOSDB_DATABASE_NAME missing ');
    if (!collectionName)
      throw new Error('environment AZURE_COSMOSDB_COLLECTION_NAME missing ');

    const list = await findOrgReposInMongoDbWithProjection(
      connectionString,
      databaseName,
      collectionName
    );

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: list
    };
  } catch (error: any) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default httpTrigger;
