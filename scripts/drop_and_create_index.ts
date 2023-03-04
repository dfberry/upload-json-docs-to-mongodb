import {
  deleteIndex,
  getIndexes,
  createIndex
} from "../shared/azure-cosmosdb-data-to-mongodb";
import { Values } from "../local.settings.json";

const connectionString = Values.AZURE_COSMOSDB_CONNECTION_STRING;
const databaseName = Values.AZURE_COSMOSDB_DATABASE_NAME;
const collectionName = Values.AZURE_COSMOSDB_COLLECTION_NAME;

if (!connectionString)
  throw new Error("environment AZURE_COSMOSDB_CONNECTION_STRING missing ");
if (!databaseName)
  throw new Error("environment AZURE_COSMOSDB_DATABASE_NAME missing ");
if (!collectionName)
  throw new Error("environment AZURE_COSMOSDB_COLLECTION_NAME missing ");

async function main() {


  const indexName = "repositoryName_1_customDateUploaded_-1";

  const deleteResponse = await deleteIndex(
    connectionString,
    databaseName,
    collectionName,
    indexName
  );
  console.log(deleteResponse);

  const list = await getIndexes(connectionString, databaseName, collectionName);
  console.log(list);

  const indexSpec = {
    customDateUploaded: -1,
    repositoryName: 1
    
  };
  const createResponse = await createIndex(
    connectionString,
    databaseName,
    collectionName,
    indexSpec
  );
  console.log(createResponse);
}
main().catch((err) => console.log(err));
