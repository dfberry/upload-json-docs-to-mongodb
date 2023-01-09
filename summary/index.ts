import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { findSummaryInMongoDb } from "../shared/azure-cosmosdb-data-to-mongodb";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const connectionString = process.env.AZURE_COSMOSDB_CONNECTION_STRING;
    const databaseName = process.env.AZURE_COSMOSDB_DATABASE_NAME;
    const collectionName =process.env.AZURE_COSMOSDB_COLLECTION_NAME;

    if(!connectionString) throw new Error("environment AZURE_COSMOSDB_CONNECTION_STRING missing ");
    if(!databaseName) throw new Error("environment AZURE_COSMOSDB_DATABASE_NAME missing ");
    if(!collectionName) throw new Error("environment AZURE_COSMOSDB_COLLECTION_NAME missing ");        

    const result = await findSummaryInMongoDb(connectionString, databaseName, collectionName+"-count");
        
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: result
    };

};

export default httpTrigger;