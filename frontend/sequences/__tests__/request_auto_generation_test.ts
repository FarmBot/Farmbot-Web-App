import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: {
    getState: () => mockState,
    dispatch: jest.fn(),
  },
}));

import { fetchResponse } from "../../__test_support__/helpers";
import { API } from "../../api";
import { error } from "../../toast/toast";
import {
  extractLuaCode, requestAutoGeneration, retrievePrompt,
} from "../request_auto_generation";

describe("requestAutoGeneration()", () => {
  API.setBaseUrl("");

  const fakeProps = () => ({
    contextKey: "color",
    onUpdate: jest.fn(),
    onSuccess: jest.fn(),
    onError: jest.fn(),
  });

  it("succeeds", async () => {
    global.fetch = jest.fn();
    jest.spyOn(global, "fetch")
      .mockResolvedValue(fetchResponse(
        jest.fn()
          .mockResolvedValue({ done: true, value: "done" })
          .mockResolvedValueOnce({ done: false, value: "r" })
          .mockResolvedValueOnce({ done: false, value: "e" })
          .mockResolvedValueOnce({ done: false, value: "d" }),
      ));
    const p = fakeProps();
    p.contextKey = "color";
    await requestAutoGeneration(p);
    await expect(p.onError).not.toHaveBeenCalled();
    await expect(p.onUpdate).toHaveBeenCalledWith("r");
    await expect(p.onUpdate).toHaveBeenCalledWith("re");
    await expect(p.onUpdate).toHaveBeenCalledWith("red");
    await expect(p.onSuccess).toHaveBeenCalledWith("red");
  });

  it("fails", async () => {
    mockState.auth = undefined;
    global.fetch = jest.fn();
    jest.spyOn(global, "fetch")
      .mockResolvedValue(fetchResponse(
        jest.fn().mockResolvedValue({ done: true, value: "" }),
        { ok: false, body: undefined },
      ));
    const p = fakeProps();
    p.contextKey = "lua";
    await requestAutoGeneration(p);
    await expect(p.onSuccess).not.toHaveBeenCalled();
    await expect(p.onError).toHaveBeenCalled();
    await expect(error).toHaveBeenCalledWith("Error: status");
  });
});

describe("retrievePrompt()", () => {
  it("returns prompt", () => {
    const result = retrievePrompt({
      kind: "lua",
      args: { lua: "return" },
      body: [
        { kind: "pair", args: { label: "prompt", value: "write code" } },
      ]
    });
    expect(result).toEqual("write code");
  });

  it("doesn't return prompt", () => {
    expect(retrievePrompt({ kind: "lua", args: { lua: "return" } })).toEqual("");
    expect(retrievePrompt({ kind: "sync", args: {} })).toEqual("");
  });
});

describe("extractLuaCode()", () => {
  it("extracts lua code", () => {
    expect(extractLuaCode(
      "Here is the code:\n```lua\n-- Return\nreturn\n```\nThe code returns."))
      .toEqual("-- Return\nreturn");
    expect(extractLuaCode("```lua\nreturn\n```")).toEqual("return");
    expect(extractLuaCode("return")).toEqual("return");
  });
});
