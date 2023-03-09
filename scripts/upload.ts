import {
  getBlobsInContainer,
  getBlobProperties,
  getBlobAsJson,
} from "../shared/azure-storage";
import { uploadArrToMongoDb } from "../shared/azure-cosmosdb-data-to-mongodb";
import { addProperty } from "../shared/json";

import { Values } from "../local.settings.json";

console.log(Values);

const connectionString = Values.AZURE_COSMOSDB_CONNECTION_STRING;
const databaseName = Values.AZURE_COSMOSDB_DATABASE_NAME;
const collectionName = Values.AZURE_COSMOSDB_COLLECTION_NAME;
const storageName = Values.AZURE_STORAGE_NAME;
const storageKey = Values.AZURE_STORAGE_KEY;
const storageContainerName = Values.AZURE_STORAGE_CONTAINER_NAME;
const storageDirectoryName = Values.AZURE_STORAGE_DIRECTORY_NAME;

if (!connectionString)
  throw new Error("environment AZURE_COSMOSDB_CONNECTION_STRING missing ");
if (!databaseName)
  throw new Error("environment AZURE_COSMOSDB_DATABASE_NAME missing ");
if (!collectionName)
  throw new Error("environment AZURE_COSMOSDB_COLLECTION_NAME missing ");

if (!storageName) throw new Error("environment AZURE_STORAGE_NAME missing ");
if (!storageKey) throw new Error("environment AZURE_STORAGE_KEY missing ");
if (!storageContainerName)
  throw new Error("environment AZURE_STORAGE_CONTAINER_NAME missing ");
if (!storageDirectoryName)
  throw new Error("environment AZURE_STORAGE_DIRECTORY_NAME missing ");

async function getUrls() {
  const results = await getBlobsInContainer(
    storageName,
    storageKey,
    storageContainerName,
    storageDirectoryName
  );

  //console.log(`results = ${JSON.stringify(results)}`);
  return results;
}
async function processUrl(blobUrl) {
  const properties = await getBlobProperties(storageName, storageKey, blobUrl);

  const customDateUploaded = "2023-03-08T08:14:00.000Z" //properties?.system?.createdOn;
  console.log(`customDateUploaded = ${customDateUploaded}`);

  const blobContents = await getBlobAsJson(storageName, storageKey, blobUrl);

  if(blobContents.error) throw Error(blobContents?.error as string)
  if((blobContents.json as []).length === 0) throw Error("blobContents.json.length === 0")
  const data: any[] = blobContents.json as any[];

  console.log(`blobContents.length = ${data.length}`);

  const newBlobContents = addProperty(
    data,
    "customDateUploaded",
    customDateUploaded
  );

  console.log(databaseName + " " + collectionName);
  // insert into mongoDB
  const result = await uploadArrToMongoDb(
    connectionString,
    databaseName,
    collectionName,
    newBlobContents
  );
  console.log(`inserted into Mongo ${result.insertedCount}`);

  const updatedCountDoc = {
    date: customDateUploaded,
    count: result?.insertedCount,
  };

  // insert count to mongoDB
  const result2 = await uploadArrToMongoDb(
    connectionString,
    databaseName,
    collectionName + "-count",
    [updatedCountDoc]
  );
  console.log(`inserted into Mongo 2 ${result.insertedCount}`);
}
async function main() {
  // console.log("starting main");
  // const results = await getUrls();
  // console.log(results);

  // for (const blobName of results.blobNames) {
  //  console.log(`https://${storageName}.blob.core.windows.net/${storageContainerName}/${blobName}`);

  // }

  const list = [
  "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-03-08T0804-azure-samples.json"
  ];

  for await (const blobUrl of list) {
     const result = await processUrl(blobUrl);
   }
}

main().catch((err) => console.log(err));
