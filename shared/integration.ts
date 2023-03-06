import { uploadArrToMongoDb } from './azure-cosmosdb-data-to-mongodb';
import { triggerDispatch } from './github';

export type BlobFunctionContent = {
  blobName: string;
  data: any[];
  log: (message: string) => void;
};

export type DispatchConfig = {
  type: string;
  owner: string;
  repo: string;
  pat: string;
};

export type DbConfig = {
  connectionString: string;
  databaseName: string;
  collectionName: string;
};

export type ProcessBlobParams = BlobFunctionContent & DbConfig & DispatchConfig;
export type ProcessBlobResult = {
  statusCode: number;
  statusMessage?: string;
};

export async function processBlob({
  blobName,
  data,
  connectionString,
  databaseName,
  collectionName,
  type,
  owner,
  repo,
  pat,
  log
}: ProcessBlobParams): Promise<ProcessBlobResult> {
  if (!blobName) {
    throw new Error('Missing blobName or data');
  }
  if (!connectionString || !databaseName || !collectionName) {
    throw new Error('Missing connectionString, databaseName or collectionName');
  }
  if (!log) {
    throw new Error('Missing log function');
  }
  if (!data || data.length === 0) {
    return {
      statusCode: 404, // Not Found,
      statusMessage: 'No data from blob found'
    };
  }
  if (!type || !owner || !repo || !pat) {
    throw new Error('Missing dispatch config');
  }

  // Add date column to data
  const newDate = new Date().toISOString();

  data.map((doc) => {
    // @ts-ignore
    doc['customDateUploaded'] = newDate;
  });

  // insert into mongoDB
  const result = await uploadArrToMongoDb(
    connectionString,
    databaseName,
    collectionName,
    data
  );

  const updatedCountDoc = {
    date: new Date(),
    count: result?.insertedCount
  };

  // insert count to mongoDB
  await uploadArrToMongoDb(
    connectionString,
    databaseName,
    collectionName + '-count',
    [updatedCountDoc]
  );
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
}
