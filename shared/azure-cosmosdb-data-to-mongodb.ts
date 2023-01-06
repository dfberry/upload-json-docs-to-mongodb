import { MongoClient, Filter, Document, InsertManyResult } from "mongodb";

export async function uploadArrToMongoDb(
  connectionString: string,
  databaseName: string,
  collectionName: string,
  arrData: unknown[]
): Promise<InsertManyResult<Document>> {
  // Data exists and looks like its in the correct shape

  if (!connectionString) throw new Error("connection string if missing");
  if (!databaseName) throw new Error("databaseName is missing");
  if (!collectionName) throw new Error("collectionName is missing");

  if (!arrData) throw new Error("data is missing");
  if (!arrData?.length || arrData.length === 0)
    throw new Error("data found to be empty");

  const client = new MongoClient(connectionString);

  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to MongoDB");

  const insertResult = await client
    .db(databaseName)
    .collection(collectionName)
    .insertMany(arrData);

  return insertResult;
}

export async function findInMongoDb(
  connectionString: string,
  databaseName: string,
  collectionName: string,
  query: Filter<Document>,
  options: any
): Promise<Array<unknown>> {
  if (!connectionString) throw new Error("connection string if missing");
  if (!databaseName) throw new Error("databaseName is missing");
  if (!collectionName) throw new Error("collectionName is missing");

  if (!query) throw new Error("query is missing");

  const client = new MongoClient(connectionString);

  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to MongoDB");

  // const sort = {};
  // sort["updatedAt"] = sortDirection;

  const options2 = {
    sort: { updatedAt: -1 }
  }


  const findResult = await client
    .db(databaseName)
    .collection(collectionName)
      //@ts-ignore
    .find(query);

  return findResult.toArray();
}
