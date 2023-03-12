import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { CONFIG } from '../shared/config';
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('debug - HTTP trigger function processed a request.');

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: {
      env: process.env,
      headers: req.headers,
      config: CONFIG
    }
  };
};

export default httpTrigger;
