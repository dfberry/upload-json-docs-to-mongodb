import { BlobFunctionContent } from './../shared/integration';
import { AzureFunction, Context } from '@azure/functions';
import { convertBufferToJson } from '../shared/conversions';
import { DbConfig, DispatchConfig, processBlob } from '../shared/integration';
import { version } from '../package.json';

import { getDbConnection } from '../shared/db-connection-cache';

import {
  FunctionEnvVarParam,
  FunctionEnvVarResult,
  getEnvVars
} from '../shared/env';

const functionEnvVariables: FunctionEnvVarParam[] = [
  { name: 'AZURE_COSMOSDB_CONNECTION_STRING', required: true, type: 'string' },
  { name: 'AZURE_COSMOSDB_DATABASE_NAME', required: true, type: 'string' },
  { name: 'AZURE_COSMOSDB_COLLECTION_NAME', required: true, type: 'string' },
  { name: 'AZURE_STORAGE_NAME', required: true, type: 'string' },
  { name: 'AZURE_STORAGE_KEY', required: true, type: 'string' },
  { name: 'DB_DISCONNECT', required: false, type: 'boolean' }
];

const blobTrigger: AzureFunction = async function (
  context: Context,
  myBlob: any /*eslint-disable-line*/
): Promise<void> {
  try {
    context.log(
      'Blob trigger begin - upload function processed blob \n Name:',
      context.bindingData.name,
      '\n Blob Size:',
      myBlob.length,
      'Bytes',
      '\n created on',
      context.bindingData.properties.createdOn,
      '\n version',
      version
    );
    const env: FunctionEnvVarResult = getEnvVars(
      functionEnvVariables,
      context.log
    );

    // Send JSON data to MongoDB
    if (context.bindingData.name.indexOf('.json') && myBlob.length > 0) {
      const connectionString = env.AZURE_COSMOSDB_CONNECTION_STRING as string;
      const databaseName = env.AZURE_COSMOSDB_DATABASE_NAME as string;
      const collectionName = env.AZURE_COSMOSDB_COLLECTION_NAME as string;

      const { isConnected, client } = await getDbConnection(
        connectionString,
        context.log
      );
      context.log('isConnected: ', isConnected);

      // Get JSON from Buffer
      const jsonDataFromBlob = convertBufferToJson(myBlob);

      const dispatchConfig: DispatchConfig = {
        type: null,
        owner: null,
        repo: null,
        pat: null
      };
      // const dispatchConfig: DispatchConfig = JSON.parse(
      //   process.env.GITHUB_ACTION_DISPATCH_CONFIG_BLOB_DATA
      // );

      const blobFunctionContent: BlobFunctionContent = {
        blobName: context.bindingData.name,
        data: jsonDataFromBlob,
        dateCreated: context.bindingData.properties.createdOn,
        log: context.log
      };
      const dbConfig: DbConfig = {
        databaseName,
        collectionName,
        client
      };
      const { statusCode } = await processBlob({
        ...dispatchConfig,
        ...blobFunctionContent,
        ...dbConfig
      });
      context.log(
        `Blob trigger end = GitHub action dispatch result: ${statusCode}`
      );

      // Close the connection to the database if the DB_DISCONNECT environment variable is set to true
      if (process.env.DB_DISCONNECT === 'true' && isConnected) {
        await client.close();
      }
    }
  } catch (error: unknown) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default blobTrigger;
