let mockPost = Promise.resolve({});
jest.mock("axios", () => ({
  post: jest.fn(() => mockPost),
}));

import { API } from "../../api";
import { error } from "../../toast/toast";
import { requestAutoGeneration, retrievePrompt } from "../request_auto_generation";

describe("requestAutoGeneration()", () => {
  API.setBaseUrl("");

  it("succeeds", async () => {
    mockPost = Promise.resolve({ data: "red" });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    await requestAutoGeneration({ contextKey: "color", onSuccess, onError });
    expect(onSuccess).toHaveBeenCalledWith("red");
    expect(onError).not.toHaveBeenCalled();
  });

  it("fails", async () => {
    mockPost = Promise.reject({ response: { data: { error: "error" } } });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    await requestAutoGeneration({ contextKey: "lua", onSuccess, onError });
    await expect(onSuccess).not.toHaveBeenCalled();
    await expect(onError).toHaveBeenCalled();
    await expect(error).toHaveBeenCalledWith("Error: error");
  });
});

describe("retrievePrompt()", () => {
  it("returns prompt", () => {
    const result = retrievePrompt({
      kind: "lua",
      args: { lua: "return" },
      body: [
        { kind: "pair", args: { label: "prompt", value: "write code" } } as never,
      ]
    });
    expect(result).toEqual("write code");
  });

  it("doesn't return prompt", () => {
    expect(retrievePrompt({ kind: "lua", args: { lua: "return" } })).toEqual("");
    expect(retrievePrompt({ kind: "sync", args: {} })).toEqual("");
  });
});
