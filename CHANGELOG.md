* sorting

    * An index must match exactly the field being sorted on. The direction of the index is not relevant. Here your initial index was a composite index on three fields so could not be used for the sort.
    * Also adding the index on the field you are sorting on may resolve the issue. Its required to index the properties that we use in the sort query. If you are planning to sort on multiple fields, you need to create a compound index. Also go through these documents( Document1, Document2 ) for finding more information regarding the indexing.
    * sorting with date and repositoryName throws errors - talk to Sidney about this.

