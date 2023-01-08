
import { Values } from "../local.settings.json";
import {
    findDateGreaterThan,
    findOrgReposInMongoDbWithProjection
  } from "../shared/azure-cosmosdb-data-to-mongodb";
import {
    MongoClient,
    Filter,
    Document,
    InsertManyResult,
    SortDirection,
    FindOptions,
    Sort,
    IndexSpecification,
  } from "mongodb";
async function main(): Promise<unknown> {

    const connectionString = Values.AZURE_COSMOSDB_CONNECTION_STRING;
    const databaseName = Values.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName =Values.AZURE_COSMOSDB_COLLECTION_NAME;

    if(!connectionString) throw new Error("environment AZURE_COSMOSDB_CONNECTION_STRING missing ");
    if(!databaseName) throw new Error("environment AZURE_COSMOSDB_DATABASE_NAME missing ");
    if(!collectionName) throw new Error("environment AZURE_COSMOSDB_COLLECTION_NAME missing ");        

    //const result = await findOrgReposInMongoDbWithProjection(connectionString, databaseName, collectionName);
    if (!connectionString) throw new Error("connection string if missing");
    if (!databaseName) throw new Error("databaseName is missing");
    if (!collectionName) throw new Error("collectionName is missing");
  
    const client = new MongoClient(connectionString);
    await client.connect();
  
    const dateAfter = await findDateGreaterThan(connectionString, databaseName, collectionName+"-count");
    console.log(dateAfter);

    const query = {
      customDateUploaded: {$gt: dateAfter},
      //repositoryName: 1
    };
  
    var projection = {
      customDateUploaded: 1.0,
      repositoryName: 1.0,
  
      "stargazers.totalCount": 1.0,
      "forks.totalCount": 1.0,
      "issues.totalCount": 1.0,
      "pullRequests.totalCount": 1.0,
      _id: 0.0,
    };
  
    const sort: Sort = {
       customDateUploaded: -1
     };
  
    var options: FindOptions = {
      sort,
      projection
    };
  
    // // @ts-ignore
    var docs = await client
      .db(databaseName)
      .collection(collectionName)
      .find(query, options)
      //.limit(10)
      .toArray();
  
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
};
async function main2(){

    const connectionString = Values.AZURE_COSMOSDB_CONNECTION_STRING;
    const databaseName = Values.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName =Values.AZURE_COSMOSDB_COLLECTION_NAME;

    if(!connectionString) throw new Error("environment AZURE_COSMOSDB_CONNECTION_STRING missing ");
    if(!databaseName) throw new Error("environment AZURE_COSMOSDB_DATABASE_NAME missing ");
    if(!collectionName) throw new Error("environment AZURE_COSMOSDB_COLLECTION_NAME missing ");        

    const list = await findOrgReposInMongoDbWithProjection(connectionString, databaseName, collectionName);
    console.log(list);
}

main().then(results=>console.log((results as any[]))).catch((err) => console.log(err));
