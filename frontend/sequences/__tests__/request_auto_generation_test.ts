let mockPost = Promise.resolve({});
jest.mock("axios", () => ({
  post: jest.fn(() => mockPost),
}));

import { API } from "../../api";
import { error } from "../../toast/toast";
import { requestAutoGeneration } from "../request_auto_generation";

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
