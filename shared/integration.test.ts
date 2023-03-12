import { describe, expect, test } from '@jest/globals';
import { enableFetchMocks, MockParams } from 'jest-fetch-mock';
import { InsertManyResult, MongoClient, ObjectId } from 'mongodb';
import * as databaseSDK from './azure-cosmosdb-data-to-mongodb';
import {
  BlobFunctionContent,
  DbConfig,
  DispatchConfig,
  processBlob,
  ProcessBlobParams
} from './integration';
enableFetchMocks();
/**
 * Mocks the entire MongoDB
 */

describe('integrations', () => {
  async function uploadArrToMongoDb_Items_Mock(): Promise<
    InsertManyResult<Document>
  > {
    //console.log('uploadArrToMongoDb_Items_Mock');
    return Promise.resolve({
      insertedCount: 3,
      acknowledged: true,
      insertedIds: {
        1: new ObjectId(),
        2: new ObjectId(),
        3: new ObjectId()
      }
    });
  }

  beforeEach(() => {
    fetchMock.resetMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('processBlob success', async () => {
    // Arrange - use this for both mongo calls
    // b/c 2nd call doesn't return data
    const spyDbData = jest
      .spyOn(databaseSDK, 'uploadArrToMongoDb')
      .mockImplementation(uploadArrToMongoDb_Items_Mock);

    // Fetch from GitHub returns 204 and no content
    const params: MockParams = {
      status: 204,
      headers: null
    };

    fetchMock.mockResponseOnce(undefined, params);

    const dispatchConfig: DispatchConfig = {
      type: 'fake type',
      owner: 'fake owner',
      repo: 'fake repo',
      pat: 'fake pat'
    };

    const dbConfig: DbConfig = {
      client: {} as MongoClient,
      databaseName: 'fake db name',
      collectionName: 'fake collection name',
      connectionString: 'fake connection string'
    };

    const blobFunctionContent: BlobFunctionContent = {
      blobName: 'fake blob name',
      data: [
        { id: 1, email: 'bgontier0@latimes.com' },
        { id: 2, email: 'ahattoe1@nationalgeographic.com' },
        { id: 3, email: 'mmaud2@psu.edu' }
      ],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      log: (_: string) => {},
      dateCreated: '2023-03-09T13:26:14+00:00'
    };

    const processBlobParams: ProcessBlobParams = {
      ...dispatchConfig,
      ...dbConfig,
      ...blobFunctionContent
    };

    const { statusCode } = await processBlob(processBlobParams);

    expect(statusCode).toBe(204);

    spyDbData.mockReset();
  });
  // test('processBlob missing required data - pat', async () => {
  //   // Arrange - use this for both mongo calls
  //   // b/c 2nd call doesn't return data
  //   let spyDbData = jest
  //     .spyOn(databaseSDK, 'uploadArrToMongoDb')
  //     .mockImplementation(uploadArrToMongoDb_Items_Mock);

  //   // Fetch from GitHub returns 204 and no content
  //   const params: MockParams = {
  //     status: 204,
  //     headers: null
  //   };

  //   fetchMock.mockResponseOnce(undefined, params);

  //   const dispatchConfig: DispatchConfig = {
  //     type: "fake type",
  //     owner: "fake owner",
  //     repo: "fake repo",
  //     pat: null,
  //   };

  //   const dbConfig:DbConfig = {
  //     connectionString: "fake string",
  //     databaseName: "fake db name",
  //     collectionName: "fake collection name"
  //   };

  //   const blobFunctionContent:BlobFunctionContent = {
  //     blobName: "fake blob name",
  //     data: [{"id":1,"email":"bgontier0@latimes.com"},
  //     {"id":2,"email":"ahattoe1@nationalgeographic.com"},
  //     {"id":3,"email":"mmaud2@psu.edu"}],
  //     log: (message: string) => {}
  //   };

  //   const processBlobParams: ProcessBlobParams = {
  //     ...dispatchConfig,
  //     ...dbConfig,
  //     ...blobFunctionContent
  //   };

  //   await expect(processBlob(processBlobParams))
  //   .rejects
  //   .toThrow('Missing dispatch config');

  //   spyDbData.mockReset();
  // });
});
