import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { CONFIG } from '../shared/config';
import {
  FunctionEnvVarParam,
  FunctionEnvVarResult,
  getEnvVars
} from '../shared/env';
import { getDbConnection } from '../shared/db-connection-cache';
import { MongoClient } from 'mongodb';
import { getBlobProperties } from '../shared/azure-storage';
import { version } from '../package.json';
const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;

const functionEnvVariables: FunctionEnvVarParam[] = [
  { name: 'AZURE_COSMOSDB_CONNECTION_STRING', required: true, type: 'string' },
  { name: 'AZURE_STORAGE_NAME', required: true, type: 'string' },
  { name: 'AZURE_STORAGE_KEY', required: true, type: 'string' },
  { name: 'DB_DISCONNECT', required: false, type: 'boolean' }
];

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('debug - HTTP trigger function processed a request.');

  context.log(req.headers);

  let blobProperties = null;
  let blobProperties2 = null;

  if (!connectionString) throw Error('No connection string provided');

  const clientDB = await MongoClient.connect(connectionString);
  const dbData = await clientDB
    .db('local-test')
    .collection('test')
    .find({})
    .limit(5)
    .toArray();

  const env: FunctionEnvVarResult = getEnvVars(
    functionEnvVariables,
    context.log
  );
  if (!env.AZURE_COSMOSDB_CONNECTION_STRING)
    throw Error('No env connection string provided');

  const { isConnected, client } = await getDbConnection(
    env.AZURE_COSMOSDB_CONNECTION_STRING as string,
    context.log
  );
  if (!isConnected || !client) throw Error('No connection to DB');
  context.log('isConnected: ', isConnected);
  const dbData2 = await client
    .db('local-test')
    .collection('test')
    .find({})
    .limit(5)
    .toArray();

  if (req?.query?.blobUrl) {
    if (!process.env.AZURE_STORAGE_NAME)
      throw Error('No storage name provided');
    if (!process.env.AZURE_STORAGE_KEY) throw Error('No storage key provided');

    if (req.query?.blobUrl) {
      blobProperties = await getBlobProperties(
        process.env.AZURE_STORAGE_NAME,
        process.env.AZURE_STORAGE_KEY,
        req.query?.blobUrl
      );

      if (!env.AZURE_STORAGE_NAME) throw Error('No env storage name provided');
      if (!env.AZURE_STORAGE_KEY) throw Error('No env storage key provided');
      blobProperties2 = await getBlobProperties(
        env.AZURE_STORAGE_NAME,
        env.AZURE_STORAGE_KEY,
        req.query?.blobUrl
      );
    }
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    headers: {
      'Content-Type': 'application/json',
      MyCustomHeader: 'Testing',
      'Access-Control-Expose-Headers': 'MyCustomHeader'
    },
    body: JSON.stringify({
      version,
      env: process.env,
      headers: req.headers,
      config: CONFIG,
      data: dbData,
      data2: dbData2,
      blobProperties,
      blobProperties2
    })
  };
};

export default httpTrigger;
