import {
  findDateGreaterThan,
  findInMongoDb
} from '../shared/azure-cosmosdb-data-to-mongodb';
import { Values } from '../local.settings.json';

const connectionString = Values.AZURE_COSMOSDB_CONNECTION_STRING;
const databaseName = Values.AZURE_COSMOSDB_DATABASE_NAME;
const collectionName = Values.AZURE_COSMOSDB_COLLECTION_NAME;

if (!connectionString)
  throw new Error('environment AZURE_COSMOSDB_CONNECTION_STRING missing ');
if (!databaseName)
  throw new Error('environment AZURE_COSMOSDB_DATABASE_NAME missing ');
if (!collectionName)
  throw new Error('environment AZURE_COSMOSDB_COLLECTION_NAME missing ');

async function main() {
  //const allList = await findInMongoDb(connectionString, databaseName, collectionName+"-count", {}, undefined);
  //console.log(allList);

  const list = await findDateGreaterThan(
    connectionString,
    databaseName,
    collectionName + '-count'
  );
  console.log(list);
}
main().catch((err) => console.log(err));
