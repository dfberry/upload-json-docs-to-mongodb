const { MongoClient } = require("mongodb");

export async function uploadArrToMongoDb(
  connectionString: string,
  databaseName: string,
  collectionName: string,
  arrData: Record<string, unknown>
): Promise<Record<string, unknown>> {
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
