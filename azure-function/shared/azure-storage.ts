const {
  StorageSharedKeyCredential,
  BlockBlobClient,
} = require("@azure/storage-blob");

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

export async function getJsonDataFromBlob(
  accountName: string,
  accountKey: string,
  blobUrl: string
): Promise<Record<string, unknown>> {
  if (!accountName) throw Error("Azure Storage accountName not found");
  if (!accountKey) throw Error("Azure Storage accountKey not found");
  if (!blobUrl) throw Error("Azure Storage blobUrl not found");

  // Create credential
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const blockBlobClient = new BlockBlobClient(blobUrl, sharedKeyCredential);

  const downloadResponse = await blockBlobClient.download();

  const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
  const jsonAsString = downloaded.toString();
  const json = JSON.parse(jsonAsString);

  // TBD: type guard json before returning

  return json;
}
