import fetch from 'node-fetch';
import { findInMongoDb } from './azure-cosmosdb-data-to-mongodb';

type DbConfigSetting = {
  ownerWithRepo: string;
  action: string;
  dispatchType: string;
};

export type EnvironmentVariables = {
  pat: string;
  dbConnectionString: string;
  databaseName: string;
  collectionName: string;
  partitionKey: string;
};

export type ContextFunctions = {
  log: any;
};

export type BuildDispatchParams = {
  dispatchType?: string;
  owner: string;
  repo: string;
  action: string;
  displayName: string;
} & EnvironmentVariables &
  ContextFunctions;

export type TriggerDispatchParams = {
  dispatchType: string;
  owner: string;
  repo: string;
  pat: string;
  log: any;
};

export type DispatchActionResult = {
  statusCode: number;
};

export async function dispatchAction(
  vars: BuildDispatchParams
): Promise<DispatchActionResult> {
  // if (!vars.owner) throw Error('owner is missing');
  // if (!vars.repo) throw Error('repo is missing');
  // if (!vars.action) throw Error('action is missing');
  // if (!vars.displayName) throw Error('displayName is missing');
  // if (!vars.pat) throw Error('pat is missing');
  // if (!vars.dbConnectionString) throw Error('dbConnectionString is missing');
  // if (!vars.databaseName) throw Error('databaseName is missing');
  // if (!vars.collectionName) throw Error('collectionName is missing');
  // if (!vars.partitionKey) throw Error('partitionKey is missing');

  const query = {
    [vars.partitionKey]: { $eq: `${vars.owner}/${vars.repo}` },
    action: { $eq: vars.action }
  };

  const options = {};

  // get config setting from database
  const configSetting = await findInMongoDb(
    vars.dbConnectionString,
    vars.databaseName,
    vars.collectionName,
    query,
    options
  );

  if (!configSetting || configSetting.length === 0)
    throw Error('config setting not found');

  const { dispatchType } = configSetting?.[0] as DbConfigSetting;

  // Scenario: trigger rebuild of next.js web site
  // TBD: extrapolate params out to encrypted storage (Key vault or Azure Storage)
  const { statusCode } = await triggerDispatch({
    dispatchType, //'data-is-ready',
    owner: vars.owner,
    repo: vars.repo,
    pat: vars.pat,
    log: vars.log
  });

  return { statusCode };
}

export async function triggerDispatch({
  dispatchType,
  owner,
  repo,
  pat,
  log
}: TriggerDispatchParams) {

  if (!dispatchType) throw Error('dispatchType is missing');
  if (!owner) throw Error('owner is missing');
  if (!repo) throw Error('repo is missing');
  if (!pat) throw Error('pat is missing');
  if (!log) throw Error('log is missing');

  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;

  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization:`token ${pat}`
    },
    body: JSON.stringify({
      "event_type": dispatchType
    })
  };

  // You need to provide a personal GitHub token with the repo access scope.
  // If your trigger also features a type, specify it in the request body:
  const response = await fetch(url, options);
  if (response.ok) {
    // No data is returned - status is 204
    log(`dispatch success: ${owner}/${repo} with type ${dispatchType} }`);
    return { statusCode: response.status };
  } else {
    // 404 or 401
    log(`dispatch failed: ${response.status} ${response.statusText}`);
    return { statusCode: response.status };
  }
}
