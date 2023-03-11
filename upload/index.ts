import { BlobFunctionContent } from './../shared/integration';
import { AzureFunction, Context } from '@azure/functions';
import { convertBufferToJson } from '../shared/conversions';
import { DbConfig, DispatchConfig, processBlob } from '../shared/integration';
import { version } from '../package.json';

import { getDbConnection } from '../shared/db-connection-cache';

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

    // Send JSON data to MongoDB
    if (context.bindingData.name.indexOf('.json') && myBlob.length > 0) {
      const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;
      const databaseName = process.env.AZURE_COSMOSDB_DATABASE_NAME;
      const collectionName = process.env.AZURE_COSMOSDB_COLLECTION_NAME;

      if (!connectionString)
        throw new Error(
          'environment AZURE_COSMOSDB_CONNECTION_STRING missing '
        );
      if (!databaseName)
        throw new Error('environment AZURE_COSMOSDB_DATABASE_NAME missing ');
      if (!collectionName)
        throw new Error('environment AZURE_COSMOSDB_COLLECTION_NAME missing ');

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
