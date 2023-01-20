import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  gitHubLastIssue,
  gitHubLastCommit,
  gitHubDefaultBranch,
  gitHubLastPr,
} from "../shared/graphql/github.graphql";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");
  const repo = req.query.repo || (req.body && req.body.repo);
  const owner = req.query.owner || (req.body && req.body.owner);

  context.log(`repo: ${repo}`);
  context.log(`owner: ${owner}`);

  if (!repo) throw new Error("incoming repo missing ");

  const gitHubPersonalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  const gitHubOwnerName = owner || process.env.GITHUB_OWNER;
  const gitHubUrl = process.env.GITHUB_URL;

  context.log(`gitHubPersonalAccessToken: ${gitHubPersonalAccessToken}`);
  context.log(`gitHubOwnerName: ${gitHubOwnerName}`);
  context.log(`gitHubUrl: ${gitHubUrl}`);

  if (!gitHubPersonalAccessToken)
    throw new Error("environment GITHUB_PERSONAL_ACCESS_TOKEN missing ");
  if (!gitHubOwnerName) throw new Error("owner missing");
  if (!gitHubUrl) throw new Error("environment GITHUB_URL missing");

  const defaultBranch: string = await gitHubDefaultBranch(
    gitHubUrl,
    gitHubPersonalAccessToken,
    gitHubOwnerName,
    repo
  );
  context.log(`default branch for ${gitHubOwnerName}/${repo}: defaultBranch`);

  const plastIssue = gitHubLastIssue(
    gitHubUrl,
    gitHubPersonalAccessToken,
    gitHubOwnerName,
    repo
  );
  const plastCommit = gitHubLastCommit(
    gitHubUrl,
    gitHubPersonalAccessToken,
    gitHubOwnerName,
    repo,
    defaultBranch
  );
  const plastPr = gitHubLastPr(
    gitHubUrl,
    gitHubPersonalAccessToken,
    gitHubOwnerName,
    repo
  );

  try {
    const results = await Promise.all([plastIssue, plastCommit, plastPr]);

    context.res = {
      body: {
        lastIssue: results[0],
        lastCommit: results[1],
        lastPr: results[2],
      },
    };
  } catch (error: any) {
    context.res = {
      status: 500 /* Defaults to 200 */,
      body: {
        error,
      },
    };
  }
};

export default httpTrigger;
