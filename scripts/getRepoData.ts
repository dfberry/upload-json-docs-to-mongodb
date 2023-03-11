import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { findRepoInMongoDbWithProjection } from '../shared/azure-cosmosdb-data-to-mongodb';
import { Values } from '../local.settings.json';
async function main(repoName): Promise<Array<unknown>> {
  const connectionString = Values.AZURE_COSMOSDB_CONNECTION_STRING;
  const databaseName = Values.AZURE_COSMOSDB_DATABASE_NAME;
  const collectionName = Values.AZURE_COSMOSDB_COLLECTION_NAME;

  if (!connectionString)
    throw new Error('environment AZURE_COSMOSDB_CONNECTION_STRING missing ');
  if (!databaseName)
    throw new Error('environment AZURE_COSMOSDB_DATABASE_NAME missing ');
  if (!collectionName)
    throw new Error('environment AZURE_COSMOSDB_COLLECTION_NAME missing ');

  const result = await findRepoInMongoDbWithProjection(
    connectionString,
    databaseName,
    collectionName,
    repoName
  );

  return result;
}

main('js-e2e')
  .then((results) => console.log(results))
  .catch((err) => console.log(err));
