import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import { fetchResponse } from "../../__test_support__/helpers";
import { API } from "../../api";
import {
  extractLuaCode, requestAutoGeneration, retrievePrompt,
} from "../request_auto_generation";

let originalGetState: typeof store.getState;
let originalFetch: typeof global.fetch;

describe("requestAutoGeneration()", () => {
  API.setBaseUrl("");

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.auth = fakeState().auth;
    originalGetState = store.getState;
    (store as unknown as { getState: () => typeof mockState }).getState =
      () => mockState;
    originalFetch = global.fetch;
  });

  afterEach(() => {
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

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
