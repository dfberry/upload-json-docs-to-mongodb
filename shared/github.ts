import fetch from 'node-fetch';

export type TriggerDispatchParams = {
  type: string;
  owner: string;
  repo: string;
  pat: string;
  log: any;
};

export type TriggerDispatchResult = {
  statusCode: number;
};

export async function triggerDispatch({
  type,
  owner,
  repo,
  pat,
  log
}: TriggerDispatchParams):Promise<TriggerDispatchResult> {
  if (!type) throw Error('dispatchType is missing');
  if (!owner) throw Error('owner is missing');
  if (!repo) throw Error('repo is missing');
  if (!pat) throw Error('pat is missing');
  if (!log) throw Error('log is missing');

  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;

  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `token ${pat}`
    },
    body: JSON.stringify({
      event_type: type
    })
  };

  // You need to provide a personal GitHub token with the repo access scope.
  // If your trigger also features a type, specify it in the request body:
  const response = await fetch(url, options);
  if (response.ok) {
    // No data is returned - status is 204
    log(`dispatch success: ${owner}/${repo} with type ${type} }`);
    return { statusCode: response.status };
  } else {
    // 404 or 401
    log(`dispatch failed: ${response.status} ${response.statusText}`);
    return { statusCode: response.status };
  }
}
