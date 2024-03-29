import { uploadArrToMongoDb } from './azure-cosmosdb-data-to-mongodb';
import { triggerDispatch } from './github';
import { getBlobAsJson, getBlobProperties } from '../shared/azure-storage';
import { MongoClient } from 'mongodb';

export type BlobFunctionContent = {
  blobName: string;
  dateCreated: string;
  data: { [key: string]: unknown }[];
  log: (_: string) => void;
};

export type DispatchConfig = {
  type: string;
  owner: string;
  repo: string;
  pat: string;
};

export type DbConfig = {
  databaseName: string;
  collectionName?: string;
  client?: MongoClient | undefined;
  connectionString?: string;
};

export type ProcessBlobParams = BlobFunctionContent & DbConfig & DispatchConfig;
export type ProcessBlobResult = {
  statusCode: number;
  statusMessage?: string;
};
export async function processBlobUrl({
  blobUrl,
  client,
  databaseName,
  collectionName,
  storageName,
  storageKey,
  log
}): Promise<ProcessBlobResult> {
  if (!blobUrl) {
    throw new Error('Missing blobUrl or data');
  }
  if (!client || !databaseName || !collectionName) {
    throw new Error('Missing client, databaseName or collectionName');
  }
  if (!log) {
    throw new Error('Missing log function');
  }

  const blobContents = await getBlobAsJson(storageName, storageKey, blobUrl);

  if (blobContents.error) throw Error(blobContents?.error as string);
  if ((blobContents.json as []).length === 0)
    throw Error('blobContents.json.length === 0');
  const data = blobContents.json as { [key: string]: unknown }[];
  const properties = await getBlobProperties(storageName, storageKey, blobUrl);
  const dateCreated = properties?.system?.createdOn as string;

  const blobName = blobUrl.split('/').pop();

  const result = await processBlob({
    blobName,
    data,
    dateCreated,
    client,
    databaseName,
    collectionName,
    type: null,
    owner: null,
    repo: null,
    pat: null,
    log
  });
  return result;
}

export async function processBlob({
  blobName,
  data,
  dateCreated,
  databaseName,
  collectionName,
  type,
  owner,
  repo,
  pat,
  client,
  log
}: ProcessBlobParams): Promise<ProcessBlobResult> {
  if (!blobName) {
    throw new Error('Missing blobName or data');
  }
  if (!client || !databaseName || !collectionName) {
    throw new Error('Missing connectionString, databaseName or collectionName');
  }

  if (!data || data.length === 0) {
    return {
      statusCode: 404, // Not Found,
      statusMessage: 'No data from blob found'
    };
  }

  data.map((doc) => {
    doc['customDateUploaded'] = dateCreated;
  });

  // insert into mongoDB
  const result = await uploadArrToMongoDb(
    client,
    databaseName,
    collectionName,
    data
  );

  const updatedCountDoc = {
    date: dateCreated,
    count: result?.insertedCount
  };

  // insert count to mongoDB
  await uploadArrToMongoDb(client, databaseName, collectionName + '-count', [
    updatedCountDoc
  ]);
  log(
    `Blob trigger result ${blobName} items ${JSON.stringify(
      result?.insertedCount
    )}`
  );

  // trigger Next.js rebuild
  if (pat && type && owner && repo) {
    const { statusCode } = await triggerDispatch({
      log,
      type,
      owner,
      repo,
      pat
    });
    return { statusCode };
  }
  return { statusCode: 201 };
}
