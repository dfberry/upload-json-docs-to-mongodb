import { BlobStorage } from '@azberry/az-simple';

export async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}
export async function getBlobProperties(accountName, accountKey, blobUrl) {
  const client = new BlobStorage(accountName, accountKey);
  const systemProperties = await client.getBlobProperties(blobUrl, {
    system: true,
    metadata: false,
    tags: false
  });
  return systemProperties;
}
export async function getBlobsInContainer(
  accountName,
  accountKey,
  containerName,
  directoryName
) {
  const delimiter = '/'; //
  const pageSettings = { maxPageSize: 100 }; // don't pass empty `continuationToken`
  const client = new BlobStorage(accountName, accountKey);
  const results = await client.listBlobsInContainer(
    containerName,
    pageSettings,
    directoryName + '/',
    delimiter
  );

  return results;
}
export async function getBlobAsJson(
  accountName,
  accountKey,
  blobUrl
): Promise<Record<string, unknown>> {
  const client = new BlobStorage(accountName, accountKey);
  const jsonData = await client.getJsonDataFromBlob(blobUrl);
  return jsonData;
}
