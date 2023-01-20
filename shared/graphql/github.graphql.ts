/* eslint no-console: 0 */ // --> OFF
import {
  GetLastIssueInRepoQueryVariables,
  GetLastIssueInRepoQuery,
  GetLastCommitInRepoQueryVariables,
  GetLastCommitInRepoQuery,
  GetLastPrInRepoQueryVariables,
  GetLastPrInRepoQuery,
  GetDefaultBranchInRepoQuery,
  GetDefaultBranchInRepoQueryVariables,
  Sdk,
  getSdk
} from '../generated/github_graphql.sdk'
import { GraphQLClient } from 'graphql-request'

/**
 * Org Repos
 * @param sdk
 * @param personal_access_token
 * @returns
 */
export async function gitHubLastIssue(
  githubUrl,
  personal_access_token: string,
  owner: string,
  repo: string
): Promise<unknown> {
  // list of repos

  if (!personal_access_token)
    throw new Error('gitHubGraphQLReposLastIssue::missing pat')

  const variables: GetLastIssueInRepoQueryVariables = {
    owner,
    repo,
    pageSize: 1,
    after: null
  }
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }
  const graphQLclient = new GraphQLClient(githubUrl)
  const sdk: Sdk = getSdk(graphQLclient)
  const data: GetLastIssueInRepoQuery = await sdk.GetLastIssueInRepo(
    variables,
    requestHeaders
  )

  const firstEdge = data?.repository?.issues?.edges[0]?.node;
  if(!firstEdge) return null;

  const remappedData = {
    title: firstEdge.title,
    url: firstEdge.url,
    issueNumber: firstEdge.number,
    state: firstEdge.state,
    createdAt: firstEdge.createdAt,
    closedAt: firstEdge.closedAt,
    participants: firstEdge?.participants?.edges.map(
      (participant) => {
        return {
          login: participant?.node?.login,
          name: participant?.node?.name,
          url: participant?.node?.url,
        };
      }
    ),
  };



  return remappedData
}
/**
 * Org Repos
 * @param sdk
 * @param personal_access_token
 * @returns
 */
export async function gitHubLastCommit(
  githubUrl,
  personal_access_token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<unknown> {
  // list of repos

  if (!personal_access_token)
    throw new Error('gitHubGraphQLReposLastCommit::missing pat')

    const graphQLclient = new GraphQLClient(githubUrl)
    const sdk: Sdk = getSdk(graphQLclient)

  const variables: GetLastCommitInRepoQueryVariables = {
    owner,
    repo,
    branch
  }
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }

  const data: GetLastCommitInRepoQuery = await sdk.GetLastCommitInRepo(
    variables,
    requestHeaders
  )

  if(data?.repository?.ref?.target) return { ...data.repository.ref.target }

  return;
}

export async function gitHubLastPr(
  githubUrl,
  personal_access_token: string,
  owner: string,
  repo: string
): Promise<unknown> {
  // list of repos

  if (!personal_access_token)
    throw new Error('gitHubGraphQLReposLastCommit::missing pat')

    const graphQLclient = new GraphQLClient(githubUrl)
    const sdk: Sdk = getSdk(graphQLclient)

  const variables: GetLastPrInRepoQueryVariables = {
    owner,
    repo
  }
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }

  const data: GetLastPrInRepoQuery = await sdk.GetLastPrInRepo(
    variables,
    requestHeaders
  )

  if(data?.repository?.refs?.nodes) return { prsByBranch: data.repository?.refs?.nodes };

  return;
}
export async function gitHubDefaultBranch(
  githubUrl,
  personal_access_token: string,
  owner: string,
  repo: string
): Promise<string> {
  // list of repos

  if (!personal_access_token)
    throw new Error('gitHubGraphQLReposLastCommit::missing pat')

    const graphQLclient = new GraphQLClient(githubUrl)
    const sdk: Sdk = getSdk(graphQLclient)

  const variables: GetDefaultBranchInRepoQueryVariables = {
    owner,
    repo
  }
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }

  const data: GetDefaultBranchInRepoQuery = await sdk.GetDefaultBranchInRepo(
    variables,
    requestHeaders
  )
  if(data?.repository?.defaultBranchRef?.name) return data.repository?.defaultBranchRef?.name;

  return;
}