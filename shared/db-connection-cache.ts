import { MongoClient } from 'mongodb';

let client=null;
let isConnected = false;

export async function getDbConnection(
  connectionString:string,
  log: (message: string) => void
): Promise<{ client: MongoClient; isConnected: boolean }> {
  try {
    if (!isConnected && !!connectionString) {
      client = new MongoClient(connectionString)
      await client.connect();
      isConnected = true;
      return {
        client,
        isConnected
      };
    }
  } catch (error) {
    log(`DB Connection error: ${error.message}`);
    throw error;
  }
}
