import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  defaultBranch,
  IGetDefaultBranchInRepoQuery,
  lastCommit,
  lastCommitRequiredParameters,
  lastIssue,
  lastIssueRequiredParameters,
  lastPr,
  lastPrRequiredParameters
} from '@diberry/github-magic';

/**
 * Connects to GitHub through github-magic and returns the last commit in a repo
 * @param context
 * @param req
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    context.log('HTTP trigger last function processed a request.');
    const repo = req.query.repo || (req.body && req.body.repo);
    const owner = req.query.owner || (req.body && req.body.owner);

    context.log(`repo: ${repo}`);
    context.log(`owner: ${owner}`);

    if (!repo) throw new Error('incoming repo missing ');

    const gitHubPersonalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const gitHubOwnerName = owner || process.env.GITHUB_OWNER;
    const gitHubUrl = process.env.GITHUB_URL;

    context.log(`gitHubPersonalAccessToken: ${gitHubPersonalAccessToken}`);
    context.log(`gitHubOwnerName: ${gitHubOwnerName}`);
    context.log(`gitHubUrl: ${gitHubUrl}`);

    if (!gitHubPersonalAccessToken)
      throw new Error('environment GITHUB_PERSONAL_ACCESS_TOKEN missing ');
    if (!gitHubOwnerName) throw new Error('owner missing');
    if (!gitHubUrl) throw new Error('environment GITHUB_URL missing');

    // Default branch
    const defaultBranchResults: IGetDefaultBranchInRepoQuery =
      await defaultBranch({
        pat: gitHubPersonalAccessToken,
        gitHubGraphQlUrl: gitHubUrl,
        owner: gitHubOwnerName,
        repo
      });
    const defaultBranchName =
      defaultBranchResults.repository.defaultBranchRef.name;
    context.log(
      `default branch for ${gitHubOwnerName}/${repo}: ${defaultBranchName}`
    );

    // Last Issue
    const lastIssueParams: lastIssueRequiredParameters = {
      gitHubGraphQlUrl: gitHubUrl,
      pat: gitHubPersonalAccessToken,
      owner: gitHubOwnerName,
      repo,
      pageSize: 1,
      after: null
    };
    const plastIssue = lastIssue(lastIssueParams);

    // Last Commit
    const branchName: string =
      defaultBranchResults.repository.defaultBranchRef.name;
    const lastCommitParams: lastCommitRequiredParameters = {
      gitHubGraphQlUrl: gitHubUrl,
      pat: gitHubPersonalAccessToken,
      owner: gitHubOwnerName,
      repo,
      branch: branchName
    };
    const plastCommit = lastCommit(lastCommitParams);

    // Last PR
    const lastPrParams: lastPrRequiredParameters = {
      gitHubGraphQlUrl: gitHubUrl,
      pat: gitHubPersonalAccessToken,
      owner: gitHubOwnerName,
      repo
    };
    const plastPr = lastPr(lastPrParams);

    const results = await Promise.all([plastIssue, plastCommit, plastPr]);

    const lastIssueResults =
      results[0]?.repository?.issues?.edges &&
      results[0]?.repository?.issues?.edges.length > 0
        ? results[0]?.repository?.issues?.edges[0]?.node
        : {};
    if (lastIssueResults && 'participants' in lastIssueResults) {
      delete lastIssueResults.participants;
    }
    if (lastIssueResults && 'labels' in lastIssueResults) {
      delete lastIssueResults.labels;
    }

    context.res = {
      body: {
        defaultBranch: defaultBranchName,
        lastIssue: lastIssueResults,
        lastCommit: results[1]?.repository?.ref?.target || {},
        lastPr:
          results[2]?.repository?.refs?.nodes &&
          results[2]?.repository?.refs?.nodes.length > 0
            ? results[2]?.repository?.refs?.nodes[0]
            : {}
      }
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
