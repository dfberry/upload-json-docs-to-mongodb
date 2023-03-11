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

if (!connectionString) throw new Error('connection string if missing');
if (!databaseName) throw new Error('databaseName is missing');
if (!collectionName) throw new Error('collectionName is missing');

async function main() {
  const config = {
    connectTimeoutMS: 500000,
    useUnifiedTopology: true
  };

  const client = new MongoClient(connectionString, config);

  // Use connect method to connect to the server
  await client.connect();
  const results = await client
    .db(databaseName)
    .collection(collectionName)
    .updateMany({ customDateUploaded: { $type: 'string' } }, [
      { $set: { customDateUploaded: { $toDate: '$customDateUploaded' } } }
    ]);

  return results;
}
main()
  .then((results) => console.log(results))
  .catch((err) => console.log(err));
