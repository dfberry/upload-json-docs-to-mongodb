import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { processBlobUrl } from '../shared/integration';
import { getDbConnection } from '../shared/db-connection-cache';

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

  const blobUrl = req.query.url || (req.body && req.body.url);
  const databaseName =
    process.env.AZURE_COSMOSDB_DATABASE_NAME || req.body.databaseName;
  const collectionName =
    process.env.AZURE_COSMOSDB_COLLECTION_NAME || req.body.collectionName;

  const storageName = process.env.AZURE_STORAGE_NAME;
  const storageKey = process.env.AZURE_STORAGE_KEY;
  const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;

  if (!blobUrl) throw Error('Missing blobUrl');
  if (!databaseName) throw Error('Missing databaseName');
  if (!collectionName) throw Error('Missing collectionName');
  if (!storageName) throw Error('Missing storageName');
  if (!storageKey) throw Error('Missing storageKey');
  if (!connectionString) throw Error('Missing connectionString');

  const { isConnected, client } = await getDbConnection(
    connectionString,
    context.log
  );
  context.log('isConnected: ', isConnected);

  if (blobUrl) {
    const result = await processBlobUrl({
      blobUrl,
      client,
      databaseName,
      collectionName,
      storageName,
      storageKey,
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
  if (process.env.DB_DISCONNECT === 'true' && isConnected) {
    await client.close();
  }
};

export default httpTrigger;
