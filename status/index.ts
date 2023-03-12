import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { version } from '../package.json';
import { getDbConnection } from '../shared/db-connection-cache';
import {
  FunctionEnvVarParam,
  FunctionEnvVarResult,
  getEnvVars
} from '../shared/env';

const functionEnvVariables: FunctionEnvVarParam[] = [
  { name: 'STATUS_SECRET', required: true, type: 'string' },
  { name: 'AZURE_COSMOSDB_CONNECTION_STRING', required: true, type: 'string' },
  { name: 'DB_DISCONNECT', required: false, type: 'boolean' }
];

/**
 * Get status of the function app
 * @param context
 * @param req
 * @returns
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('HTTP trigger status function processed a request.');

  try {
    const env: FunctionEnvVarResult = getEnvVars(
      functionEnvVariables,
      context.log
    );

    // secret's don't match
    if (
      Object.prototype.hasOwnProperty.call(req.query, 'secret') &&
      req.query?.secret !== env.STATUS_SECRET
    ) {
      context.res = {
        status: 401,
        body: {
          message: 'Unauthorized - status secret is missing or incorrect'
        }
      };
      return;
    } else if (req.query?.secret === env.STATUS_SECRET) {
      // secret's match
      const { isConnected, client } = await getDbConnection(
        env.AZURE_COSMOSDB_CONNECTION_STRING as string,
        context.log
      );
      context.log('isConnected: ', isConnected);

      // Close the connection to the database if the DB_DISCONNECT environment variable is set to true
      if (process.env?.DB_DISCONNECT === 'true' && isConnected) {
        await client.close();
      }

      context.res = {
        status: 200,
        body: {
          version,
          env: process.env,
          headers: req.headers,
          dbIsConnected: isConnected,
          message: 'secrets match'
        }
      };
    } else {
      // secret is missing - only public information is available
      context.res = {
        status: 200,
        body: {
          version,
          message: 'public'
        }
      };
      return;
    }
  } catch (error: unknown) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default httpTrigger;
