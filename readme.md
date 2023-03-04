# Blog trigger to Cosmos DB docs

Azure Function in TypeScript, using Blob Storage Trigger to watch for JSON file containing array of items to upload to MongoDB.

## Azure Storage Explorer

* [Download](https://azure.microsoft.com/en-us/products/storage/storage-explorer/#features)

## Azurite connection string

### HTTP

```
DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;
```

### HTTPS

```
DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=https://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=https://127.0.0.1:10001/devstoreaccount1;TableEndpoint=https://127.0.0.1:10002/devstoreaccount1
```

### Processed

## APIs

### dispatch API

Invoke a GitHub action by its named `repository_dispatch` property's `types` value. Uses the `GITHUB_PERSONAL_ACCESS_TOKEN_DISPATCH` environment variables as the GitHub pat with REPO permission. 

1. Goal is to match this function's `dispatch` API to invoke _some_ repository action. The action yaml file must have a `types` value that matches the `type` in the query-string.

```yaml
on:
  repository_dispatch:
    types:
      - data-is-ready
```

2. Example `dispatch` API call with cURL.

```bash
curl --location 'http://localhost:7071/api/dispatch?owner=dfberry&repo=actions-test&type=data-is-ready'
```

3. Must resolve to correct GitHub REST call to create a [repository dispatch event](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-dispatch-event). With caveats:

* `Authorization: token <YOUR-PAT>` - didn't use bearer token
* Didn't need version - but may in the future
* Didn't pass any payload

```bash
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{"event_type":"on-demand-test","client_payload":{"unit":false,"integration":true}}'
```