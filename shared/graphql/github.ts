import { getSdk, Sdk } from '../generated/github_graphql.sdk';
import { GraphQLClient } from 'graphql-request';

export async function getLastIssue(gitHubPersonalAccessToken:string, repoOwner: string, repoName: string, urlGraphQL= 'https://api.github.com/graphql' ):Promise<any>{

    const fnRequired = {
        owner: repoOwner,
        repo: repoName
    }

    const requestHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${gitHubPersonalAccessToken}`
      }

    const sdk: Sdk = getSdk(new GraphQLClient(urlGraphQL))
    const data = await sdk.GetLastIssueInRepo(fnRequired, requestHeaders)
    return data;
} 