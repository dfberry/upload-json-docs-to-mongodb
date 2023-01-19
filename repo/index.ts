import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { findRepoInMongoDbWithProjection } from "../shared/azure-cosmosdb-data-to-mongodb";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const repoName = (req.query.name || (req.body && req.body.name));

    const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;
    const databaseName = process.env.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName =process.env.AZURE_COSMOSDB_COLLECTION_NAME;

    if(!connectionString) throw new Error("environment AZURE_COSMOSDB_CONNECTION_STRING missing ");
    if(!databaseName) throw new Error("environment AZURE_COSMOSDB_DATABASE_NAME missing ");
    if(!collectionName) throw new Error("environment AZURE_COSMOSDB_COLLECTION_NAME missing ");        

    const result = await findRepoInMongoDbWithProjection(connectionString, databaseName, collectionName, repoName);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: result
    };

};

export default httpTrigger;