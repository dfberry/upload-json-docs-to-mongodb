import {
  Document,
  Filter,
  FindOptions,
  IndexSpecification,
  InsertManyResult,
  MongoClient,
  Sort
} from 'mongodb';

export async function uploadArrToMongoDb(
  client: MongoClient,
  databaseName: string,
  collectionName: string,
  arrData: unknown[]
): Promise<InsertManyResult<Document>> {
  // Data exists and looks like its in the correct shape

  if (!client) throw new Error('mongo client string if missing');
  if (!databaseName) throw new Error('databaseName is missing');
  if (!collectionName) throw new Error('collectionName is missing');

  if (!arrData) throw new Error('data is missing');
  if (!arrData?.length || arrData.length === 0)
    throw new Error('data found to be empty');

  const insertResult = await client
    .db(databaseName)
    .collection(collectionName)
    .insertMany(arrData);

  return insertResult;
}

export async function findInMongoDb(
  client: MongoClient,
  databaseName: string,
  collectionName: string,
  query: Filter<Document>,
  _: unknown //options
): Promise<Array<unknown>> {
  if (!client) throw new Error('connection string if missing');
  if (!databaseName) throw new Error('databaseName is missing');
  if (!collectionName) throw new Error('collectionName is missing');

  if (!query) throw new Error('query is missing');

  // const sort = {};
  // sort["updatedAt"] = sortDirection;

  // const options2 = {
  //   sort: { updatedAt: -1 }
  // };

  const findResult = await client
    .db(databaseName)
    .collection(collectionName)
    .find(query);

  return findResult.toArray();
}
export async function findRepoInMongoDbWithProjection(
  client: MongoClient,
  databaseName: string,
  collectionName: string,
  repoName: string
): Promise<Array<unknown>> {
  if (!client) throw new Error('connection string if missing');
  if (!databaseName) throw new Error('databaseName is missing');
  if (!collectionName) throw new Error('collectionName is missing');

  const query = {
    repositoryName: {
      $eq: repoName
    }
  };

  const projection = {
    customDateUploaded: 1.0,
    'stargazers.totalCount': 1.0,
    'forks.totalCount': 1.0,
    'issues.totalCount': 1.0,
    'pullRequests.totalCount': 1.0,
    _id: 0.0
  };

  // most recent entry in the collection
  const sort: Sort = {
    customDateUploaded: -1
  };

  const options: FindOptions = {
    sort,
    projection,
    limit: 100
  };

  const docs = await client
    .db(databaseName)
    .collection(collectionName)
    .find(query, options)
    .toArray();

  // var docs = [];

  // while(await cursor.hasNext()) {
  //   const doc = await cursor.next();
  //   docs.push(doc);
  // }

  // transform
  docs.map((doc) => {
    doc.stars = doc.stargazers?.totalCount || 0;
    doc.forks = doc.forks?.totalCount || 0;
    doc.issues = doc.issues?.totalCount || 0;
    doc.pr = doc.pullRequests?.totalCount || 0;

    delete doc.stargazers;
    delete doc.pullRequests;
    delete doc.forks.totalCount;
    delete doc.issues.totalCount;
  });

  return docs;
}

export async function getIndexes(
  client: MongoClient,
  databaseName: string,
  collectionName: string
) {
  const indexList = await client
    .db(databaseName)
    .collection(collectionName)
    .indexes();

  return indexList;
}
export async function createIndex(
  client: MongoClient,
  databaseName: string,
  collectionName: string,
  indexDefinition: IndexSpecification
) {
  const indexResult = await client
    .db(databaseName)
    .collection(collectionName)
    .createIndex(indexDefinition);

  return indexResult;
}
export async function deleteIndex(
  client: MongoClient,
  databaseName: string,
  collectionName: string,
  indexName: string
) {
  const indexResult = await client
    .db(databaseName)
    .collection(collectionName)
    .dropIndex(indexName);

  return indexResult;
}
export async function findOrgReposInMongoDbWithProjection(
  client: MongoClient,
  databaseName: string,
  collectionName: string
): Promise<Array<unknown>> {
  if (!client) throw new Error('connection string if missing');
  if (!databaseName) throw new Error('databaseName is missing');
  if (!collectionName) throw new Error('collectionName is missing');

  const dateAfter = await findDateGreaterThan(
    client,
    databaseName,
    collectionName + '-count'
  );

  const query = {
    customDateUploaded: { $gt: dateAfter }
  };
  /*
    var projection = {
      customDateUploaded: 1.0,
      repositoryName: 1.0,
  
      "stargazers.totalCount": 1.0,
      "forks.totalCount": 1.0,
      "issues.totalCount": 1.0,
      "pullRequests.totalCount": 1.0,
      _id: 0.0,
    };*/

  const projection = {
    lastPushToDefaultBranch: 1.0,
    is: 1.0,
    has: 1.0,
    legal: 1.0,
    languages: 1.0,
    diskUsage: 1.0,
    date: 1.0,
    customDateUploaded: 1,
    repositoryName: 1.0,
    'watchers.totalCount': 1,
    'stargazers.totalCount': 1.0,
    'forks.totalCount': 1.0,
    'issues.totalCount': 1.0,
    'pullRequests.totalCount': 1.0
  };

  const sort: Sort = {
    customDateUploaded: -1
  };

  const options: FindOptions = {
    sort,
    projection
  };

  const docs = await client
    .db(databaseName)
    .collection(collectionName)
    .find(query, options)
    .toArray();

  // transform
  docs.map((doc) => {
    doc.watchers = doc.watchers.totalCount;
    doc.stars = doc.stargazers.totalCount;
    doc.forks = doc.forks.totalCount;
    doc.issues = doc.issues.totalCount;
    doc.pr = doc.pullRequests.totalCount;

    delete doc.watchers.totalCount;
    delete doc.stargazers;
    delete doc.pullRequests;
    delete doc.forks.totalCount;
    delete doc.issues.totalCount;
  });

  docs.sort();

  docs.sort(function (a, b) {
    const nameA = a.repositoryName.toLowerCase(),
      nameB = b.repositoryName.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0; // No sorting
  });

  return docs;
}

export async function findDateGreaterThan(
  client: MongoClient,
  databaseName: string,
  collectionName: string
): Promise<unknown> {
  if (!client) throw new Error('connection string if missing');
  if (!databaseName) throw new Error('databaseName is missing');
  if (!collectionName) throw new Error('collectionName is missing');

  const query = {};
  const sort: Sort = {
    date: -1
  };
  const projection = {
    date: 1.0,
    _id: 0.0
  };
  const options: FindOptions = {
    sort,
    skip: 1,
    limit: 1,
    projection
  };

  const docs = await client
    .db(databaseName)
    .collection(collectionName)
    .find(query, options)
    .toArray();

  return docs[0].date;
}
export async function findSummaryInMongoDb(
  client: MongoClient,
  databaseName: string,
  collectionName: string
): Promise<Array<unknown>> {
  if (!client) throw new Error('connection string if missing');
  if (!databaseName) throw new Error('databaseName is missing');
  if (!collectionName) throw new Error('collectionName is missing');

  const query = {};
  const sort: Sort = {
    date: -1
  };
  const projection = {
    date: 1.0,
    count: 1.0,
    _id: 0.0
  };
  const options: FindOptions = {
    sort,
    limit: 100,
    projection
  };

  const findResult = await client
    .db(databaseName)
    .collection(collectionName)
    .find(query, options)
    .toArray();

  return findResult;
}
