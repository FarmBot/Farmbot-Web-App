import { API } from "../../api";
import axios from "axios";
import * as crud from "../../api/crud";
import {
  snapshotGarden, applyGarden, destroySavedGarden, closeSavedGarden,
  openSavedGarden, openOrCloseGarden, newSavedGarden, unselectSavedGarden,
  copySavedGarden,
} from "../actions";
import { Actions } from "../../constants";
import {
  fakeSavedGarden, fakePlantTemplate,
} from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";

let postSpy: jest.SpyInstance;
let patchSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let initSaveGetIdSpy: jest.SpyInstance;

beforeEach(() => {
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
    await snapshotGarden(navigate);
    expect(axios.post).toHaveBeenCalledWith(API.current.snapshotPath, {});
  });

  it("calls with garden name", async () => {
    const navigate = jest.fn();
    await snapshotGarden(navigate, "new saved garden", "notes");
    expect(axios.post).toHaveBeenCalledWith(
      API.current.snapshotPath, { name: "new saved garden", notes: "notes" });
  });
});

describe("applyGarden", () => {
  it("calls the API and lets auto-sync do the rest", async () => {
    API.setBaseUrl("example.io");
    const navigate = jest.fn();
    const dispatch = jest.fn();
    await applyGarden(navigate, 4)(dispatch);
    expect(axios.patch).toHaveBeenCalledWith(API.current.applyGardenPath(4));
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith(unselectSavedGarden);
  });
});

describe("destroySavedGarden", () => {
  it("deletes garden", () => {
    const dispatch = jest.fn((_) => Promise.resolve());
    const navigate = jest.fn();
    destroySavedGarden(navigate, "SavedGardenUuid")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(unselectSavedGarden);
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(crud.destroy).toHaveBeenCalledWith("SavedGardenUuid");
  });
});

describe("closeSavedGarden", () => {
  it("closes garden", () => {
    const navigate = jest.fn();
    const dispatch = jest.fn();
    closeSavedGarden(navigate)(dispatch);
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith(unselectSavedGarden);
  });
});

describe("openSavedGarden", () => {
  it("opens garden", () => {
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const id = 1;
    openSavedGarden(navigate, id)(dispatch);
    expect(navigate).toHaveBeenCalledWith(Path.savedGardens(1));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_SAVED_GARDEN,
      payload: id,
    });
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
    openOrCloseGarden(props)();
    expect(props.navigate).toHaveBeenCalledWith(Path.savedGardens(1));
  });

  it("closes garden", () => {
    const props = {
      navigate: jest.fn(),
      savedGardenId: 1,
      dispatch: jest.fn(),
      gardenIsOpen: true,
    };
    openOrCloseGarden(props)();
    expect(props.navigate).toHaveBeenCalledWith(Path.plants());
  });
});

describe("newSavedGarden", () => {
  it("creates a new saved garden", async () => {
    const navigate = jest.fn();
    await newSavedGarden(navigate, "my saved garden", "notes")(
      jest.fn(() => Promise.resolve()));
    expect(crud.initSave).toHaveBeenCalledWith(
      "SavedGarden", { name: "my saved garden", notes: "notes" });
  });

  it("creates a new saved garden with default name", async () => {
    const navigate = jest.fn();
    await newSavedGarden(navigate, "", "")(jest.fn(() => Promise.resolve()));
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
    await copySavedGarden(fakeProps())(jest.fn(() => Promise.resolve(5)));
    expect(crud.initSaveGetId).toHaveBeenCalledWith("SavedGarden",
      { name: "Saved Garden 1 (copy)" });
    await expect(crud.initSave).toHaveBeenCalledWith("PlantTemplate",
      expect.objectContaining({ saved_garden_id: 5 }));
  });

  it("creates copy with provided name", async () => {
    const p = fakeProps();
    p.newSGName = "New copy";
    await copySavedGarden(p)(jest.fn(() => Promise.resolve()));
    expect(crud.initSaveGetId).toHaveBeenCalledWith("SavedGarden",
      { name: p.newSGName });
  });
});
