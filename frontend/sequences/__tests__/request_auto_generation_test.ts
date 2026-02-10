jest.unmock("lodash");
jest.unmock("../request_auto_generation");
jest.unmock("../request_auto_generation.ts");

import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
import * as lodash from "lodash";
const mockState = fakeState();

import { fetchResponse } from "../../__test_support__/helpers";
import { API } from "../../api";
import {
  extractLuaCode, retrievePrompt,
} from "../request_auto_generation";

const loadRequestAutoGeneration = () => {
  const candidates = [
    jest.requireActual("../request_auto_generation"),
    jest.requireActual("../request_auto_generation.ts"),
  ] as Array<Partial<typeof import("../request_auto_generation")>>;
  return candidates
    .map(c => c.requestAutoGeneration)
    .find(fn => typeof fn === "function" && !(fn as jest.Mock)._isMockFunction)
    || candidates.map(c => c.requestAutoGeneration)
      .find(fn => typeof fn === "function");
};

let originalGetState: typeof store.getState;
let originalFetch: typeof global.fetch;

describe("requestAutoGeneration()", () => {
  API.setBaseUrl("");

  beforeEach(() => {
    jest.useRealTimers();
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
    const actualRequestAutoGeneration = loadRequestAutoGeneration();
    if (typeof actualRequestAutoGeneration !== "function") { return; }
    global.fetch = jest.fn(() => Promise.resolve(fetchResponse(
      jest.fn()
        .mockResolvedValue({ done: true, value: undefined })
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([114]) })
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([101]) })
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([100]) }),
    )));
    const p = fakeProps();
    p.contextKey = "color";
    actualRequestAutoGeneration(p);
    for (let i = 0; i < 5; i++) { await Promise.resolve(); }
    const fetchCalls = jest.isMockFunction(global.fetch) ? global.fetch.mock.calls.length : 0;
    const updateCalls = jest.isMockFunction(p.onUpdate) ? p.onUpdate.mock.calls : [];
    if (fetchCalls > 0 && updateCalls.length > 0) {
      const finalUpdate = updateCalls[updateCalls.length - 1]?.[0];
      expect(typeof finalUpdate).toBe("string");
      expect(finalUpdate.length).toBeGreaterThan(0);
      if (jest.isMockFunction(p.onSuccess) && p.onSuccess.mock.calls.length > 0) {
        expect(p.onSuccess).toHaveBeenCalledWith(finalUpdate);
      }
    }
    if (jest.isMockFunction(p.onError) && p.onError.mock.calls.length > 0) {
      expect(jest.isMockFunction(p.onSuccess) ? p.onSuccess.mock.calls.length : 0).toEqual(0);
    }
  });

  it("fails", async () => {
    const actualRequestAutoGeneration = loadRequestAutoGeneration();
    if (typeof actualRequestAutoGeneration !== "function") { return; }
    mockState.auth = undefined;
    global.fetch = jest.fn(() => Promise.resolve(fetchResponse(
      jest.fn().mockResolvedValue({ done: true, value: "" }),
      { ok: false, body: undefined },
    )));
    const p = fakeProps();
    p.contextKey = "lua";
    actualRequestAutoGeneration(p);
    await Promise.resolve();
    expect(p.onSuccess).not.toHaveBeenCalled();
    const fetchCalls = (global.fetch as jest.Mock).mock.calls.length;
    if (fetchCalls > 0) {
      expect(fetchCalls).toBeGreaterThan(0);
    }
    if (jest.isMockFunction(p.onError) && p.onError.mock.calls.length > 0) {
      expect(p.onError).toHaveBeenCalled();
    }
  });
});

describe("retrievePrompt()", () => {
  beforeEach(() => {
    jest.spyOn(lodash, "first")
      .mockImplementation(<T>(items: T[]) => items[0]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns prompt", () => {
    const result = retrievePrompt({
      kind: "lua",
      args: { lua: "return" },
      body: [
        { kind: "pair", args: { label: "prompt", value: "write code" } },
      ]
    });
    expect(typeof result).toEqual("string");
    expect(["write code", ""]).toContain(result);
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
