import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { processBlobUrl } from '../shared/integration';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  context.log('insert HTTP trigger function processed a request.');

  const blobUrl = req.query.url || (req.body && req.body.url);
  const databaseName = process.env.AZURE_COSMOSDB_DATABASE_NAME || req.body.databaseName;
  const collectionName = process.env.AZURE_COSMOSDB_COLLECTION_NAME || req.body.collectionName;

  const storageName = process.env.AZURE_STORAGE_NAME;
  const storageKey = process.env.AZURE_STORAGE_KEY;
  const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;

  if(!blobUrl) throw Error("Missing blobUrl")
  if(!databaseName) throw Error("Missing databaseName")
  if(!collectionName) throw Error("Missing collectionName")
  if(!storageName) throw Error("Missing storageName")
  if(!storageKey) throw Error("Missing storageKey")
  if(!connectionString) throw Error("Missing connectionString")

  if (blobUrl) {
    const result = await processBlobUrl({
      blobUrl,
      connectionString,
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
};

export default httpTrigger;
