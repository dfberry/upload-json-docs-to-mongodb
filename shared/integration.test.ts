import { beforeAll, describe, expect, test } from '@jest/globals';
import { BlobFunctionContent, DbConfig, DispatchConfig, processBlob, ProcessBlobParams } from './integration';

import * as databaseSDK from './azure-cosmosdb-data-to-mongodb';

import { enableFetchMocks, MockParams } from 'jest-fetch-mock';
enableFetchMocks();


describe('integrations', () => {

  async function uploadArrToMongoDb_Items_Mock(): Promise<any> {
    console.log('uploadArrToMongoDb_Items_Mock');
    return Promise.resolve({
      insertedCount: 3
    });
  }

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('processBlob success', async () => {
    // Arrange - use this for both mongo calls
    // b/c 2nd call doesn't return data
    let spyDbData = jest
      .spyOn(databaseSDK, 'uploadArrToMongoDb')
      .mockImplementation(uploadArrToMongoDb_Items_Mock);

    // Fetch from GitHub returns 204 and no content
    const params: MockParams = {
      status: 204,
      headers: null
    };

    fetchMock.mockResponseOnce(undefined, params);

    const dispatchConfig: DispatchConfig = {
      type: "fake type",
      owner: "fake owner",
      repo: "fake repo",
      pat: "fake pat",
    };

    const dbConfig:DbConfig = {
      connectionString: "fake string",
      databaseName: "fake db name",
      collectionName: "fake collection name"
    };

    const blobFunctionContent:BlobFunctionContent = {
      blobName: "fake blob name",
      data: [{"id":1,"email":"bgontier0@latimes.com"},
      {"id":2,"email":"ahattoe1@nationalgeographic.com"},
      {"id":3,"email":"mmaud2@psu.edu"}],
      log: (message: string) => {}
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
