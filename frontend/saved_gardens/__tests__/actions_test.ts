jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve()),
  patch: jest.fn(() => Promise.resolve({
    headers: { "x-farmbot-rpc-id": "123" }
  })),
}));

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  initSave: jest.fn(),
  initSaveGetId: jest.fn(),
}));

import { API } from "../../api";
import axios from "axios";
import {
  snapshotGarden, applyGarden, destroySavedGarden, closeSavedGarden,
  openSavedGarden, openOrCloseGarden, newSavedGarden, unselectSavedGarden,
  copySavedGarden,
} from "../actions";
import { Actions } from "../../constants";
import { destroy, initSave, initSaveGetId } from "../../api/crud";
import {
  fakeSavedGarden, fakePlantTemplate,
} from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";

describe("snapshotGarden", () => {
  it("calls the API and lets auto-sync do the rest", () => {
    API.setBaseUrl("example.io");
    const navigate = jest.fn();
    snapshotGarden(navigate);
    expect(axios.post).toHaveBeenCalledWith(API.current.snapshotPath, {});
  });

  it("calls with garden name", () => {
    const navigate = jest.fn();
    snapshotGarden(navigate, "new saved garden", "notes");
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
    expect(destroy).toHaveBeenCalledWith("SavedGardenUuid");
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
  it("creates a new saved garden", () => {
    const navigate = jest.fn();
    newSavedGarden(navigate, "my saved garden", "notes")(
      jest.fn(() => Promise.resolve()));
    expect(initSave).toHaveBeenCalledWith(
      "SavedGarden", { name: "my saved garden", notes: "notes" });
  });

  it("creates a new saved garden with default name", () => {
    const navigate = jest.fn();
    newSavedGarden(navigate, "", "")(jest.fn(() => Promise.resolve()));
    expect(initSave).toHaveBeenCalledWith(
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
    expect(initSaveGetId).toHaveBeenCalledWith("SavedGarden",
      { name: "Saved Garden 1 (copy)" });
    await expect(initSave).toHaveBeenCalledWith("PlantTemplate",
      expect.objectContaining({ saved_garden_id: 5 }));
  });

  it("creates copy with provided name", () => {
    const p = fakeProps();
    p.newSGName = "New copy";
    copySavedGarden(p)(jest.fn(() => Promise.resolve()));
    expect(initSaveGetId).toHaveBeenCalledWith("SavedGarden",
      { name: p.newSGName });
  });
});
