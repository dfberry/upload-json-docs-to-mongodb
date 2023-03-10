import { describe, expect, test, beforeEach } from "@jest/globals";
import { Context, HttpRequest } from "@azure/functions";
import httpTrigger from "./index";
import * as LOCALENV from "../local.settings.json";

describe("Status", () => {
  let context: Context;
  let request: HttpRequest;

  beforeEach(() => {
    // Really crude and unsafe implementations that will be replaced soon
    context = { log: () => {} } as unknown as Context;
    request = { query: {}} as unknown as HttpRequest;
  });

  afterAll(() => {
    //process.env = OLD_ENV; // Restore old environment
  });

  test("with secret ok", async () => {

    const secret = "secret";

    process.env.STATUS_SECRET = secret;
    process.env.AZURE_COSMOSDB_CONNECTION_STRING= LOCALENV.Values.AZURE_COSMOSDB_CONNECTION_STRING;
    process.env.DB_DISCONNECT = 'true';

    request.query.secret = secret;
    await httpTrigger(context, request);
    expect(context.res.body.hasOwnProperty("version")).toBe(true);
    expect(context.res.body.hasOwnProperty("env")).toBe(true);
    expect(context.res.body.hasOwnProperty("headers")).toBe(true);
    expect(context.res.body.hasOwnProperty("dbIsConnected")).toBe(true);
  });

  test("w secret not ok", async () => {
    process.env.STATUS_SECRET = "secret";
    process.env.AZURE_COSMOSDB_CONNECTION_STRING= LOCALENV.Values.AZURE_COSMOSDB_CONNECTION_STRING;
    process.env.DB_DISCONNECT = 'true';
    request.query.secret = "";
    await expect(httpTrigger(context, request))
    expect(context.res.status).toEqual(401);
  });

  test("w/o secret", async () => {
    process.env.STATUS_SECRET = "";
    process.env.AZURE_COSMOSDB_CONNECTION_STRING= LOCALENV.Values.AZURE_COSMOSDB_CONNECTION_STRING;
    process.env.DB_DISCONNECT = 'true';
    await expect(httpTrigger(context, request))
    expect(context.res.status).toEqual(500);
  });

});