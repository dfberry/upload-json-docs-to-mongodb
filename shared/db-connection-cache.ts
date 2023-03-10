import { MongoClient } from 'mongodb';

let client = null;
let isConnected = false;

export type DbConnection = {
  client: MongoClient | undefined;
  isConnected: boolean;
};

export async function getDbConnection(
  connectionString: string,
  log: (message: string) => void
): Promise<DbConnection> {
  try {
    if (!isConnected && !!connectionString) {
      client = new MongoClient(connectionString);
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
