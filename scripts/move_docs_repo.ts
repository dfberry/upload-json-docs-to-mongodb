import {
  findInMongoDb,
  uploadArrToMongoDb
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

  const query = {};
  const options = {};

  const collectionFrom = "AggregatedReposNext";
  const collectionTo = "AggregatedRepos";

  const repoData = await findInMongoDb(connectionString, databaseName, collectionFrom, query, options)
  const uploadedResult = await uploadArrToMongoDb(connectionString, databaseName, collectionTo, repoData);
  console.log(uploadedResult);
}
main().catch((err) => console.log(err));
