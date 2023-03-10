import { describe, expect, test, beforeEach } from "@jest/globals";
import { sortJson } from "./json";

describe("JSON", () => {

  beforeEach(() => {
  });

  afterAll(() => {
  });

  test("Sort JSON", async () => {
    const jsonRaw = {
      "John": "3",
      "Peter": "5",
      "Amy": "2"
    }
    const jsonCorrect = {
      "Amy": "2",
      "John": "3",
      "Peter": "5"
    }

    const sortedJson = sortJson(jsonRaw);
    expect(JSON.stringify(sortedJson)).toEqual(JSON.stringify(jsonCorrect));
    expect(JSON.stringify(sortedJson)).not.toEqual(JSON.stringify(jsonRaw));
  });

  test("Sort empty JSON", async () => {
    const jsonRaw = {};

    const sortedJson = sortJson(jsonRaw);
    expect(sortedJson).toEqual(jsonRaw);
  });
});