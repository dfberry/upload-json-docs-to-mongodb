import fetch from 'node-fetch';

describe('Debug e2e', () => {
  test('success', async () => {
    const response = await fetch(
      'http://127.0.0.1:7071/api/debug?blobUrl=https://ghstoragedfb.blob.core.windows.net/test/simple-json-3.json'
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(Object.prototype.hasOwnProperty.call(data, 'version')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(data, 'env')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(data, 'headers')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(data, 'config')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(data, 'data')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(data, 'data2')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(data, 'blobProperties')).toBe(
      true
    );
    expect(Object.prototype.hasOwnProperty.call(data, 'blobProperties2')).toBe(
      true
    );
  });
});
