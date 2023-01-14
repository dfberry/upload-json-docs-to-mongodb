import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getLastIssue } from "../shared/graphql/github";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const repoName = (req.query.repo || (req.body && req.body.repo));
    const ownerName = (req.query.owner || (req.body && req.body.owner));

    const gitHubPersonalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

    if(!repoName) throw new Error("incoming param 'repo' missing ");
    if(!ownerName) throw new Error("incoming param 'owner' missing");
    if(!gitHubPersonalAccessToken) throw new Error("environment GITHUB_PERSONAL_ACCESS_TOKEN missing ");        

    const result = await getLastIssue(gitHubPersonalAccessToken, ownerName, repoName);
        
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: result
    };

};

export default httpTrigger;