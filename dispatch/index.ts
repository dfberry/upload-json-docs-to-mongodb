import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { dispatchAction } from '../shared/github';


const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    context.log('Dispatch HTTP trigger function processed a request.');

    const owner = req.query.owner || (req.body && req.body.owner);
    const repo = req.query.repo || (req.body && req.body.repo);
    const action = req.query.action || (req.body && req.body.action);

    if (!owner) throw Error('owner is missing');
    if (!repo) throw Error('repo is missing');
    if (!action) throw Error('action is missing');

    const pat = process.env.GITHUB_PERSONAL_ACCESS_TOKEN_DISPATCH;
    const dbConnectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;
    const databaseName = process.env.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName =
      process.env.AZURE_COSMOSDB_COLLECTION_CONFIG_SETTINGS_NAME;
    const partitionKey =
      process.env.AZURE_COSMOSDB_COLLECTION_CONFIG_SETTINGS_PARTITION_KEY;

    if (!pat) throw Error('pat is missing');
    if (!dbConnectionString) throw Error('dbConnectionString is missing');
    if (!databaseName) throw Error('databaseName is missing');
    if (!collectionName) throw Error('collectionName is missing');
    if (!partitionKey) throw Error('partitionKey is missing');

    const {statusCode} = await dispatchAction({
      dispatchType:null,
      owner,
      repo,
      action,
      displayName:null,
      pat,
      dbConnectionString,
      databaseName,
      collectionName,
      partitionKey,
      log:context.log
    })

    context.res = {
       status: statusCode
    };
  } catch (error: unknown) {
    context.log(error);
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: error
    };
  }
};

export default httpTrigger;
