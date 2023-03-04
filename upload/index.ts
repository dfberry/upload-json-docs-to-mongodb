import { AzureFunction, Context } from '@azure/functions';
import { convertBufferToJson } from '../shared/conversions';
import { uploadArrToMongoDb } from '../shared/azure-cosmosdb-data-to-mongodb';
import { triggerDispatch } from '../shared/github';

const blobTrigger: AzureFunction = async function (
  context: Context,
  myBlob: any
): Promise<void> {
  try {
    context.log(
      'Blob trigger upload function processed blob \n Name:',
      context.bindingData.name,
      '\n Blob Size:',
      myBlob.length,
      'Bytes'
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

      // Get JSON from Buffer
      const jsonDataFromBlob = convertBufferToJson(myBlob);

      // Add date column to data
      jsonDataFromBlob.map((doc) => {
        doc['customDateUploaded'] = new Date();
      });

      // insert into mongoDB
      const result = await uploadArrToMongoDb(
        connectionString,
        databaseName,
        collectionName,
        jsonDataFromBlob
      );

      const updatedCountDoc = {
        date: new Date(),
        count: result?.insertedCount
      };

      // insert count to mongoDB
      const result2 = await uploadArrToMongoDb(
        connectionString,
        databaseName,
        collectionName + '-count',
        [updatedCountDoc]
      );
      context.log(
        'Blob trigger result `',
        context.bindingData.name,
        '` items `',
        JSON.stringify(result?.insertedCount),
        '`'
      );

      // trigger rebuild of next.js web site
      // TBD: extrapolate params out - to key vault secret as entire JSON object
      // await triggerDispatch({
      //   dispatchType: 'data-is-ready',
      //   owner: 'dfberry',
      //   repo: 'github-data-dashboard-nextjs',
      //   pat: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      //   log: context.log
      // });
    }
  } catch (error: any) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default blobTrigger;
