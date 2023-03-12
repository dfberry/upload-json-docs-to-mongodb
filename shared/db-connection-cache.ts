import { MongoClient } from 'mongodb';

let client: MongoClient = null;
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
      client = await MongoClient.connect(connectionString);
      isConnected = true;
      return {
        client,
        isConnected
      };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      log(`DB Connection error: ${error?.message}`);
    }
    throw error;
  }
}
