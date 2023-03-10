import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { version } from '../package.json';
import { getDbConnection } from '../shared/db-connection-cache';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('HTTP trigger status function processed a request.');

  try {
    const statusSecret = process.env.STATUS_SECRET || '';
    const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING || '';

    if (!connectionString)
      throw new Error('AZURE_COSMOSDB_CONNECTION_STRING is missing');
    if (!statusSecret) throw new Error('STATUS_SECRET is missing');

    if (req.query.secret !== statusSecret) {
      context.res = {
        status: 401,
        body: {
          message: 'Unauthorized - status secret is missing or incorrect'
        }
      };
      return;
    }

    const { isConnected, client } = await getDbConnection(
      connectionString,
      context.log
    );

    context.log('isConnected: ', isConnected);

    // Close the connection to the database if the DB_DISCONNECT environment variable is set to true
    if (process.env.DB_DISCONNECT === 'true' && isConnected) {
      await client.close();
    }

    context.res = {
      status: 200,
      body: {
        version,
        env: process.env,
        headers: req.headers,
        dbIsConnected: isConnected
      }
    };
  } catch (error: any) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default httpTrigger;
