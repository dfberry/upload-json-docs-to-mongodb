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

  const { isConnected, client } = await getDbConnection(
    env.AZURE_COSMOSDB_CONNECTION_STRING as string,
    context.log
  );
  context.log('isConnected: ', isConnected);
  const dbData2 = await client
    .db('local-test')
    .collection('test')
    .find({})
    .limit(5)
    .toArray();

  let blobProperties = null;
  let blobProperties2 = null;
  if (req.query?.blobUrl) {
    blobProperties = await getBlobProperties(
      process.env.AZURE_STORAGE_NAME,
      process.env.AZURE_STORAGE_KEY,
      req.query?.blobUrl
    );
    blobProperties2 = await getBlobProperties(
      env.AZURE_STORAGE_NAME,
      env.AZURE_STORAGE_KEY,
      req.query?.blobUrl
    );
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: {
      env: process.env,
      headers: req.headers,
      config: CONFIG,
      data: dbData,
      data2: dbData2,
      blobProperties,
      blobProperties2
    }
  };
};

export default httpTrigger;
