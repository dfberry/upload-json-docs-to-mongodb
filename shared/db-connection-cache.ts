import { MongoClient } from 'mongodb';

export type DbConnection = {
  client: MongoClient | undefined;
  isConnected: boolean;
};

const currentDbConnection: DbConnection = {
  client: null,
  isConnected: false
};

export async function getDbConnection(
  connectionString: string,
  log: (message: string) => void
): Promise<DbConnection> {
  try {
    if (!currentDbConnection.isConnected && !!connectionString) {
      log(`DB Connection string: ${connectionString}`);
      currentDbConnection.client = await MongoClient.connect(connectionString);
      currentDbConnection.isConnected = true;
    }
    log(`DB Connection: ${currentDbConnection.isConnected}`);
    return currentDbConnection;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log(`DB Connection error: ${error?.message}`);
    }
    throw error;
  }
}
