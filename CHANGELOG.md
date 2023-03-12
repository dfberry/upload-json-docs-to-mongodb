# 4.0.2

* More details in /debug

# 4.0.1

* Update local.settings.sample.json

# 4.0.0

* /debug - requires admin code

# 3.0.1

* fixes for config/env

# 3.0.0

* global db connection
* ESLint 
* types
* tests

# 2.0.1

* test /status - mock db connection

# 2.0.0

* /status requires STATUS_SECRET env match
* Test for Json sort
* Add Jest and VSCode debug for Jest
* Add db connection in run time

# 1.3.3

* Add version to upload output

# 1.3.2

* Get date from blob

# 1.3.1

* /statue - returns env, http headers too

# 1.3.0

* POST /insert - process blob image by blob url, databaseName, collectionName
* revert dispatch now

# 1.2.0

* Refactor upload to include triggering a GitHub action by its dispatch type. Used to rebuild the [Next.js app](https://github.com/dfberry/github-data-dashboard-nextjs/actions). 
* Add Jest
    * Need tests but not convinced these are the right tests
    * Jest isn't doing much at this point
* Changes Upload input binding to pull container path information from runtime environment variables with `%` syntax. This allows the upload function to be configurable from the environment settings. 
    ```
          "path": "%AZURE_STORAGE_CONTAINER_NAME%/%AZURE_STORAGE_DIRECTORY_NAME%/{name}",
    ```
    * TBD: this still makes the function single purpose/use b/c their is only 1 set of environment variables. How do make upload more generic at the environment setting level so other blob upload systems can be service such as my user data (diberry) instead of org (azure-samples)? 

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

