import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { gitHubLastIssue, gitHubLastCommit } from "../shared/graphql/github.graphql";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const repo = (req.query.repo || (req.body && req.body.repo));
    const owner = (req.query.owner || (req.body && req.body.owner));
    const branch = (req.query.branch || (req.body && req.body.branch));

    context.log(`repo: ${repo}`);
    context.log(`owner: ${owner}`);
    context.log(`branch: ${branch}`);

    if(!repo) throw new Error("incoming repo missing ");
    if(!branch) throw new Error("incoming branch missing");

    const gitHubPersonalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const gitHubOwnerName = owner || process.env.GITHUB_OWNER;
    const gitHubUrl = process.env.GITHUB_URL;

    context.log(`gitHubPersonalAccessToken: ${gitHubPersonalAccessToken}`);
    context.log(`gitHubOwnerName: ${gitHubOwnerName}`);
    context.log(`gitHubUrl: ${gitHubUrl}`);

    if(!gitHubPersonalAccessToken) throw new Error("environment GITHUB_PERSONAL_ACCESS_TOKEN missing ");
    if(!gitHubOwnerName) throw new Error("owner missing");
    if(!gitHubUrl) throw new Error("environment GITHUB_URL missing");

    const lastIssue = await gitHubLastIssue(gitHubUrl, gitHubPersonalAccessToken, gitHubOwnerName, repo);
    const lastCommit = await gitHubLastCommit(gitHubUrl, gitHubPersonalAccessToken, gitHubOwnerName, repo, branch);

    context.res = {
        body: {
            lastIssue,
            lastCommit
        }

    };

};

export default httpTrigger;