# 1.1.0

* dispatch API trigger's GitHub repo's action based on type
    * 'http://localhost:7071/api/dispatch?owner=dfberry&repo=actions-test&type=data-is-ready'
    * [Docs](./README.md#dispatch-api)

# 1.0.2

* Return empty object instead of no object at all 
* /api/status - returns version from package.json
* error handling for 500
    * post error to Azure Functions context log
    * returns full error to requestor

# 1.0.1

* Add `.prettierrc`
* Update `/org` to return more extended repo properties
* Switch out GraphQL for @diberry/github-magic

# 0.0.0

* sorting

    * An index must match exactly the field being sorted on. The direction of the index is not relevant. Here your initial index was a composite index on three fields so could not be used for the sort.
    * Also adding the index on the field you are sorting on may resolve the issue. Its required to index the properties that we use in the sort query. If you are planning to sort on multiple fields, you need to create a compound index. Also go through these documents( Document1, Document2 ) for finding more information regarding the indexing.
    * sorting with date and repositoryName throws errors - talk to Sidney about this.

