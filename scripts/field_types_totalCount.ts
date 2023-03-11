import {
  MongoClient,
  Filter,
  Document,
  InsertManyResult,
  SortDirection,
  FindOptions,
  Sort,
  IndexSpecification
} from 'mongodb';
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
  const client = new MongoClient(connectionString);

  // Use connect method to connect to the server
  await client.connect();
  const results = await client
    .db(databaseName)
    .collection(collectionName)
    .aggregate([
      { $project: { _id: 0, fieldType: { $type: '$issues.totalCount' } } },
      { $group: { _id: { fieldType: '$fieldType' }, count: { $sum: 1 } } }
    ])
    .toArray();
  client.close();
  return results;
}
main()
  .then((results) => console.log(results))
  .catch((err) => console.log(err));
