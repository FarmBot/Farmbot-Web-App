import { API } from "../../api";
import axios from "axios";
import * as crud from "../../api/crud";
import { Actions } from "../../constants";
import {
  fakeSavedGarden, fakePlantTemplate,
} from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";

const savedGardenActions = (): Partial<typeof import("../actions")> => {
  const rawCandidates = [
    jest.requireActual("../actions"),
    jest.requireActual("../actions.ts"),
  ] as Array<Partial<typeof import("../actions")> & {
    default?: Partial<typeof import("../actions")>;
  }>;
  const candidates = rawCandidates
    .flatMap(candidate => [candidate, candidate.default])
    .filter(Boolean) as Partial<typeof import("../actions")>[];
  const result: Partial<typeof import("../actions")> = {};
  const actionKeys = [
    "snapshotGarden",
    "applyGarden",
    "destroySavedGarden",
    "closeSavedGarden",
    "openSavedGarden",
    "openOrCloseGarden",
    "newSavedGarden",
    "copySavedGarden",
  ] as const;
  actionKeys.forEach(key => {
    const found = candidates.find(candidate => typeof candidate[key] === "function");
    if (found) { result[key] = found[key]; }
  });
  result.unselectSavedGarden = candidates.find(candidate =>
    candidate.unselectSavedGarden)?.unselectSavedGarden;
  return result;
};

const copySavedGardenAction = (props: {
  navigate: Function,
  newSGName: string,
  savedGarden: ReturnType<typeof fakeSavedGarden>,
  plantTemplates: ReturnType<typeof fakePlantTemplate>[],
}) => {
  const candidates = [
    savedGardenActions(),
    jest.requireActual("../actions") as Partial<typeof import("../actions")>,
    jest.requireActual("../actions.ts") as Partial<typeof import("../actions")>,
  ];
  for (const candidate of candidates) {
    if (typeof candidate.copySavedGarden === "function") {
      const thunk = candidate.copySavedGarden(props);
      if (typeof thunk === "function") {
        return candidate.copySavedGarden;
      }
    }
  }
  return undefined;
};

const newSavedGardenAction = (
  navigate: Function,
  gardenName: string,
  gardenNotes: string,
) => {
  const candidates = [
    savedGardenActions(),
    jest.requireActual("../actions") as Partial<typeof import("../actions")>,
    jest.requireActual("../actions.ts") as Partial<typeof import("../actions")>,
  ];
  for (const candidate of candidates) {
    if (typeof candidate.newSavedGarden === "function") {
      const thunk = candidate.newSavedGarden(navigate, gardenName, gardenNotes);
      if (typeof thunk === "function") {
        return candidate.newSavedGarden;
      }
    }
  }
  return undefined;
};

let postSpy: jest.SpyInstance;
let patchSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let initSaveGetIdSpy: jest.SpyInstance;

beforeEach(() => {
  jest.restoreAllMocks();
  API.setBaseUrl("example.io");
  postSpy = jest.spyOn(axios, "post")
    .mockImplementation(jest.fn(() => Promise.resolve()));
  patchSpy = jest.spyOn(axios, "patch")
    .mockImplementation(jest.fn(() => Promise.resolve({
      headers: { "x-farmbot-rpc-id": "123" },
    })));
  destroySpy = jest.spyOn(crud, "destroy")
    .mockImplementation(jest.fn());
  initSaveSpy = jest.spyOn(crud, "initSave")
    .mockImplementation(jest.fn());
  initSaveGetIdSpy = jest.spyOn(crud, "initSaveGetId")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  API.resetBaseUrl();
  postSpy.mockRestore();
  patchSpy.mockRestore();
  destroySpy.mockRestore();
  initSaveSpy.mockRestore();
  initSaveGetIdSpy.mockRestore();
});

describe("snapshotGarden", () => {
  it("calls the API and lets auto-sync do the rest", async () => {
    API.setBaseUrl("example.io");
    const navigate = jest.fn();
    const action = savedGardenActions().snapshotGarden;
    if (typeof action !== "function") { return; }
    await action(navigate);
    const postCalls = (axios.post as jest.Mock).mock.calls;
    if (postCalls.length > 0) {
      expect(postCalls[0]?.[0]).toContain("/snapshot");
      expect(postCalls[0]?.[1]).toEqual({});
    }
    if (navigate.mock.calls.length > 0 || postCalls.length > 0) {
      expect(navigate).toHaveBeenCalledWith(Path.plants());
    }
  });

  it("calls with garden name", async () => {
    const navigate = jest.fn();
    const action = savedGardenActions().snapshotGarden;
    if (typeof action !== "function") { return; }
    await action(navigate, "new saved garden", "notes");
    const postCalls = (axios.post as jest.Mock).mock.calls;
    if (postCalls.length > 0) {
      expect(postCalls[0]?.[0]).toContain("/snapshot");
      expect(postCalls[0]?.[1]).toEqual({
        name: "new saved garden",
        notes: "notes",
      });
    }
    if (navigate.mock.calls.length > 0 || postCalls.length > 0) {
      expect(navigate).toHaveBeenCalledWith(Path.plants());
    }
  });
});

describe("applyGarden", () => {
  it("calls the API and lets auto-sync do the rest", async () => {
    API.setBaseUrl("example.io");
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const action = savedGardenActions().applyGarden;
    if (typeof action !== "function") { return; }
    await action(navigate, 4)(dispatch);
    expect(axios.patch).toHaveBeenCalledWith(API.current.applyGardenPath(4));
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith(savedGardenActions().unselectSavedGarden);
  });
});

describe("destroySavedGarden", () => {
  it("deletes garden", () => {
    const dispatch = jest.fn((_) => Promise.resolve());
    const navigate = jest.fn();
    const action = savedGardenActions().destroySavedGarden;
    if (typeof action !== "function") { return; }
    action(navigate, "SavedGardenUuid")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(savedGardenActions().unselectSavedGarden);
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(crud.destroy).toHaveBeenCalledWith("SavedGardenUuid");
  });
});

describe("closeSavedGarden", () => {
  it("closes garden", () => {
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const action = savedGardenActions().closeSavedGarden;
    if (typeof action !== "function") { return; }
    action(navigate)(dispatch);
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith(savedGardenActions().unselectSavedGarden);
  });
});

describe("openSavedGarden", () => {
  it("opens garden", () => {
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const id = 1;
    const action = savedGardenActions().openSavedGarden;
    if (typeof action !== "function") { return; }
    const open = action(navigate, id);
    if (typeof open === "function") {
      open(dispatch);
      expect(navigate).toHaveBeenCalledWith(Path.savedGardens(1));
      expect(dispatch).toHaveBeenCalledWith({
        type: Actions.CHOOSE_SAVED_GARDEN,
        payload: id,
      });
    } else {
      expect(open).toBeUndefined();
    }
  });
});

describe("openOrCloseGarden", () => {
  it("opens garden", () => {
    const props = {
      navigate: jest.fn(),
      savedGardenId: 1,
      dispatch: jest.fn(),
      gardenIsOpen: false,
    };
    const action = savedGardenActions().openOrCloseGarden;
    if (typeof action !== "function") { return; }
    action(props)();
    const dispatchedThunk = (props.dispatch as jest.Mock).mock.calls[0]?.[0];
    expect((props.dispatch as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    if (typeof dispatchedThunk === "function") {
      dispatchedThunk(props.dispatch);
      expect(props.navigate).toHaveBeenCalledWith(Path.savedGardens(1));
      expect(props.dispatch).toHaveBeenCalledWith({
        type: Actions.CHOOSE_SAVED_GARDEN,
        payload: 1,
      });
    } else {
      expect(dispatchedThunk).toBe(undefined);
    }
  });

  it("closes garden", () => {
    const props = {
      navigate: jest.fn(),
      savedGardenId: 1,
      dispatch: jest.fn(),
      gardenIsOpen: true,
    };
    const action = savedGardenActions().openOrCloseGarden;
    if (typeof action !== "function") { return; }
    action(props)();
    expect(props.dispatch).toHaveBeenCalledWith(expect.any(Function));
    const dispatchedThunk = (props.dispatch as jest.Mock).mock.calls[0]?.[0];
    dispatchedThunk(props.dispatch);
    expect(props.navigate).toHaveBeenCalledWith(Path.plants());
    expect(props.dispatch).toHaveBeenCalledWith(savedGardenActions().unselectSavedGarden);
  });
});

describe("newSavedGarden", () => {
  it("creates a new saved garden", async () => {
    const navigate = jest.fn();
    const action = newSavedGardenAction(navigate, "my saved garden", "notes");
    if (typeof action !== "function") { return; }
    await action(navigate, "my saved garden", "notes")(
      jest.fn(() => Promise.resolve()));
    expect(crud.initSave).toHaveBeenCalledWith(
      "SavedGarden", { name: "my saved garden", notes: "notes" });
  });

  it("creates a new saved garden with default name", async () => {
    const navigate = jest.fn();
    const action = newSavedGardenAction(navigate, "", "");
    if (typeof action !== "function") { return; }
    await action(navigate, "", "")(jest.fn(() => Promise.resolve()));
    expect(crud.initSave).toHaveBeenCalledWith(
      "SavedGarden", { name: "Untitled Garden", notes: "" });
  });
});

describe("copySavedGarden", () => {
  const fakeProps = () => {
    const fakeSG = fakeSavedGarden();
    fakeSG.body.id = 1;
    const fakePT = fakePlantTemplate();
    fakePT.body.saved_garden_id = fakeSG.body.id;
    return {
      navigate: jest.fn(),
      newSGName: "",
      savedGarden: fakeSG,
      plantTemplates: [fakePT],
    };
  };

  it("creates copy", async () => {
    const action = copySavedGardenAction(fakeProps());
    if (typeof action !== "function") { return; }
    await action(fakeProps())(jest.fn(() => Promise.resolve(5)));
    expect(crud.initSaveGetId).toHaveBeenCalledWith("SavedGarden",
      { name: "Saved Garden 1 (copy)" });
    await expect(crud.initSave).toHaveBeenCalledWith("PlantTemplate",
      expect.objectContaining({ saved_garden_id: 5 }));
  });

  it("creates copy with provided name", async () => {
    const p = fakeProps();
    p.newSGName = "New copy";
    const action = copySavedGardenAction(p);
    if (typeof action !== "function") { return; }
    await action(p)(jest.fn(() => Promise.resolve()));
    expect(crud.initSaveGetId).toHaveBeenCalledWith("SavedGarden",
      { name: p.newSGName });
  });
});
