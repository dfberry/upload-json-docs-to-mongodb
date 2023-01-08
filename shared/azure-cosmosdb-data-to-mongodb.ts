import { SASProtocol } from "@azure/storage-blob";
import {
  MongoClient,
  Filter,
  Document,
  InsertManyResult,
  SortDirection,
  FindOptions,
  Sort,
  IndexSpecification
} from "mongodb";

export async function uploadArrToMongoDb(
  connectionString: string,
  databaseName: string,
  collectionName: string,
  arrData: unknown[]
): Promise<InsertManyResult<Document>> {
  // Data exists and looks like its in the correct shape

  if (!connectionString) throw new Error("connection string if missing");
  if (!databaseName) throw new Error("databaseName is missing");
  if (!collectionName) throw new Error("collectionName is missing");

  if (!arrData) throw new Error("data is missing");
  if (!arrData?.length || arrData.length === 0)
    throw new Error("data found to be empty");

  console.log(connectionString);
  console.log(databaseName);
  console.log(collectionName);

  const client = new MongoClient(connectionString);

  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to MongoDB");

  const insertResult = await client
    .db(databaseName)
    .collection(collectionName)
    .insertMany(arrData);

  return insertResult;
}

export async function findInMongoDb(
  connectionString: string,
  databaseName: string,
  collectionName: string,
  query: Filter<Document>,
  options: any
): Promise<Array<unknown>> {
  if (!connectionString) throw new Error("connection string if missing");
  if (!databaseName) throw new Error("databaseName is missing");
  if (!collectionName) throw new Error("collectionName is missing");

  if (!query) throw new Error("query is missing");

  const client = new MongoClient(connectionString);

  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to MongoDB");

  // const sort = {};
  // sort["updatedAt"] = sortDirection;

  const options2 = {
    sort: { updatedAt: -1 },
  };

  const findResult = await client
    .db(databaseName)
    .collection(collectionName)
    //@ts-ignore
    .find(query);

  return findResult.toArray();
}
export async function findRepoInMongoDbWithProjection(
  connectionString: string,
  databaseName: string,
  collectionName: string,
  repoName: string
): Promise<Array<unknown>> {
  if (!connectionString) throw new Error("connection string if missing");
  if (!databaseName) throw new Error("databaseName is missing");
  if (!collectionName) throw new Error("collectionName is missing");

  const client = new MongoClient(connectionString);
  await client.connect();
  const query = {
    repositoryName: {
      $eq: repoName,
    },
  };

  var projection = {
    customDateUploaded: 1.0,
    "stargazers.totalCount": 1.0,
    "forks.totalCount": 1.0,
    "issues.totalCount": 1.0,
    "pullRequests.totalCount": 1.0,
    _id: 0.0,
  };

  const sort:Sort = {
    customDateUploaded: -1,
  };

  var options:FindOptions = {
    sort,
    projection,
    limit: 100,
  };

  // @ts-ignore
  var docs = await client
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
    doc.stars = doc.stargazers.totalCount;
    doc.forks = doc.forks.totalCount;
    doc.issues = doc.issues.totalCount;
    doc.pr = doc.pullRequests.totalCount;

    delete doc.stargazers;
    delete doc.pullRequests;
    delete doc.forks.totalCount;
    delete doc.issues.totalCount;
  });

  client.close();
  return docs;
}

export async function getIndexes(
  connectionString: string,
  databaseName: string,
  collectionName: string
) {
  const client = new MongoClient(connectionString);
  await client.connect();

  const indexList = await client
    .db(databaseName)
    .collection(collectionName)
    .indexes();

  client.close();
  return indexList;
}
export async function createIndex(
  connectionString: string,
  databaseName: string,
  collectionName: string,
  indexDefination: IndexSpecification
) {
  const client = new MongoClient(connectionString);
  await client.connect();

  const indexResult = await client
    .db(databaseName)
    .collection(collectionName)
    .createIndex(indexDefination);

  client.close();
  return indexResult;
}
