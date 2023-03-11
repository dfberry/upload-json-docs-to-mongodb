import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { triggerDispatch } from '../shared/github';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    context.log('Dispatch HTTP trigger function processed a request.');

    const owner = req.query.owner || (req.body && req.body.owner);
    const repo = req.query.repo || (req.body && req.body.repo);
    const type = req.query.type || (req.body && req.body.type);

    if (!owner) throw Error('owner is missing');
    if (!repo) throw Error('repo is missing');
    if (!type) throw Error('type is missing');

    const pat = process.env.GITHUB_PERSONAL_ACCESS_TOKEN_DISPATCH;
    if (!pat) throw Error('pat is missing');

    const { statusCode } = await triggerDispatch({
      type,
      owner,
      repo,
      pat,
      log: context.log
    });

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
