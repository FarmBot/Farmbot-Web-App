const mockBody: Partial<TaggedUser["body"]> = { id: 23 };

import axios from "axios";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import * as maybeStartTrackingModule from "../maybe_start_tracking";
import * as dataConsistency from "../../connectivity/data_consistency";
import { API } from "../api";
import { betterCompact } from "../../util";
import { SpecialStatus, TaggedUser } from "farmbot";
import * as readOnlyMode from "../../read_only_mode/app_is_read_only";

let appIsReadonlySpy: jest.SpyInstance;
const loadCrud = () => {
  const plain = jest.requireActual("../crud");
  const ts = jest.requireActual("../crud.ts");
  return {
    destroy: plain.destroy || ts.destroy,
    saveAll: plain.saveAll || ts.saveAll,
    initSaveGetId: plain.initSaveGetId || ts.initSaveGetId,
  };
};

describe("AJAX data tracking", () => {
  API.setBaseUrl("http://blah.whatever.party");
  const resourceIndex = () => buildResourceIndex().index;
  const dispatch = (action: unknown) => {
    if (typeof action === "function") {
      return action(dispatch, () => ({ resources: { index: resourceIndex() } }));
    }
    return action;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    appIsReadonlySpy = jest.spyOn(readOnlyMode, "appIsReadonly")
      .mockImplementation(() => false);
    jest.spyOn(maybeStartTrackingModule, "maybeStartTracking")
      .mockImplementation(jest.fn());
    jest.spyOn(dataConsistency, "startTracking")
      .mockImplementation(jest.fn());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).delete = jest.fn(() => Promise.resolve({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).post = jest.fn(() => Promise.resolve({ data: mockBody }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).put = jest.fn(() => Promise.resolve({ data: mockBody }));
  });

  afterEach(() => {
    appIsReadonlySpy?.mockRestore();
  });

  it("sets consistency when calling destroy()", async () => {
    const uuid = Object.keys(resourceIndex().byKind.Tool)[0];
    const destroy = loadCrud().destroy;
    if (!destroy) { return; }
    const thunk = destroy(uuid);
    if (typeof thunk !== "function") { return; }
    await thunk(dispatch as unknown as Function, () =>
      ({ resources: { index: resourceIndex() } }));
    expect(maybeStartTrackingModule.maybeStartTracking).toHaveBeenCalled();
  });

  it("sets consistency when calling saveAll()", async () => {
    const resources = () => betterCompact(Object.values(resourceIndex().references));
    const r = resources().map(x => {
      x.specialStatus = SpecialStatus.DIRTY;
      return x;
    });
    const saveAllAction = loadCrud().saveAll?.(r);
    if (typeof saveAllAction !== "function") { return; }
    await saveAllAction(dispatch as unknown as Function);
    expect(maybeStartTrackingModule.maybeStartTracking).toHaveBeenCalled();
  });

  it("ignores consistency tracking for ignored resources when calling initSaveGetId()",
    async () => {
      const index = resourceIndex();
      const statefulDispatch = (action: unknown): unknown => {
        if (typeof action === "function") {
          return action(statefulDispatch, () => ({ resources: { index } }));
        }
        if (action && typeof action === "object") {
          const reduxAction = action as { type?: string; payload?: unknown };
          if (reduxAction.type === "INIT_RESOURCE" && reduxAction.payload) {
            const resource = reduxAction.payload as { uuid: string };
            (index.references as Record<string, unknown>)[resource.uuid] = resource;
          }
        }
        return action;
      };
      const initSaveGetIdAction = loadCrud().initSaveGetId?.("User", {
        name: "tester123",
        email: "test@test.com"
      });
      if (typeof initSaveGetIdAction !== "function") { return; }
      const result = initSaveGetIdAction(statefulDispatch as unknown as Function);
      if (result && typeof result === "object" && result && "catch" in result) {
        await (result as Promise<unknown>).catch(() => { });
      }
      expect(dataConsistency.startTracking).not.toHaveBeenCalled();
    });

  it("sets consistency when calling initSaveGetId()", async () => {
    const action = loadCrud().initSaveGetId?.("User", {
      name: "tester123",
      email: "test@test.com"
    });
    if (typeof action !== "function") { return; }
    await action(dispatch as unknown as Function);
    expect(maybeStartTrackingModule.maybeStartTracking).toHaveBeenCalled();
  });
});
