import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { findInMongoDb } from "../shared/azure-cosmosdb-data-to-mongodb";
import {
  getBlobsInContainer,
  getBlobProperties,
  getBlobAsJson,
} from "../shared/azure-storage";
import { uploadArrToMongoDb } from "../shared/azure-cosmosdb-data-to-mongodb";
import { addProperty } from "../shared/json";

import { Values } from "../local.settings.json";

const connectionString = Values.AZURE_COSMOSDB_CONNECTION_STRING;
const databaseName = Values.AZURE_COSMOSDB_DATABASE_NAME;
const collectionName = process.env.AZURE_COSMOSDB_COLLECTION_NAME;
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

  //onsole.log(`results = ${JSON.stringify(results)}`);
  return results;
}
async function processUrl(blobUrl) {
  const properties = await getBlobProperties(storageName, storageKey, blobUrl);

  const customDateUploaded = properties?.system?.createdOn;
  console.log(`customDateUploaded = ${customDateUploaded}`);

  const blobContents = await getBlobAsJson(storageName, storageKey, blobUrl);
  console.log(`blobContents.length = ${blobContents?.length}`);

  const newBlobContents = addProperty(
    blobContents.json,
    "customDateUploaded",
    customDateUploaded
  );
  // insert into mongoDB
  const result = await uploadArrToMongoDb(
    connectionString,
    databaseName,
    collectionName,
    newBlobContents
  );
  console.log(`inserted into Mongo ${result.insertedCount}`);

  const updatedCountDoc = {
    date: new Date(),
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
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-10T0336-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-10T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-11T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-12T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-12T1634-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-13T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-14T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-15T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-16T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-17T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-18T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-19T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-20T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-21T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-22T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-23T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-24T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-25T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-26T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-27T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-28T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-29T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-30T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2022-12-31T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-01-01T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-01-02T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-01-03T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-01-04T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-01-05T0800-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-01-06T0801-azure-samples.json",
    "https://ghstoragedfb.blob.core.windows.net/github-graphql/org_repos/2023-01-07T0800-azure-samples.json",
  ];

  for await (const blobUrl of list) {
     const result = await processUrl(blobUrl);
   }
}

main().catch((err) => console.log(err));
