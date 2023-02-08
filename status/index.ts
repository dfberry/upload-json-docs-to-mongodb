import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { version } from '../package.json';
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('HTTP trigger status function processed a request.');

 
  try {

    context.res = {
      body: {
        version
        
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
