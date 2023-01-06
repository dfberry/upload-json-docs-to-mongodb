import { uploadArrToMongoDb, findInMongoDb } from './azure-cosmosdb-data-to-mongodb';
//import { getJsonDataFromBlob } from './azure-storage';
import { convertBufferToJson } from './conversions';

export default {
    uploadToMongoDb: uploadArrToMongoDb,
//    getFromBlob: getJsonDataFromBlob,
    convertBufferToJson,
    findInMongoDb: findInMongoDb
}