jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve()),
  patch: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
  initSave: jest.fn(),
  initSaveGetId: jest.fn(),
}));

import { API } from "../../../api";
import axios from "axios";
import {
  snapshotGarden, applyGarden, destroySavedGarden, closeSavedGarden,
  openSavedGarden, openOrCloseGarden, newSavedGarden, unselectSavedGarden,
  copySavedGarden
} from "../actions";
import { history } from "../../../history";
import { Actions } from "../../../constants";
import { destroy, initSave, initSaveGetId } from "../../../api/crud";
import {
  fakeSavedGarden, fakePlantTemplate
} from "../../../__test_support__/fake_state/resources";

describe("snapshotGarden", () => {
  it("calls the API and lets auto-sync do the rest", () => {
    API.setBaseUrl("example.io");
    snapshotGarden();
    expect(axios.post).toHaveBeenCalledWith(API.current.snapshotPath, {});
  });

  it("calls with garden name", () => {
    snapshotGarden("new saved garden");
    expect(axios.post).toHaveBeenCalledWith(
      API.current.snapshotPath, { name: "new saved garden" });
  });
});

describe("applyGarden", () => {
  it("calls the API and lets auto-sync do the rest", async () => {
    API.setBaseUrl("example.io");
    const dispatch = jest.fn();
    await applyGarden(4)(dispatch);
    expect(axios.patch).toHaveBeenCalledWith(API.current.applyGardenPath(4));
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
    expect(dispatch).toHaveBeenCalledWith(unselectSavedGarden);
  });
});

describe("destroySavedGarden", () => {
  it("deletes garden", () => {
    const dispatch = jest.fn(() => Promise.resolve());
    destroySavedGarden("SavedGardenUuid")(dispatch);
    expect(destroy).toHaveBeenCalledWith("SavedGardenUuid");
    expect(dispatch).toHaveBeenLastCalledWith(unselectSavedGarden);
  });
});

describe("closeSavedGarden", () => {
  it("closes garden", () => {
    const dispatch = jest.fn();
    closeSavedGarden()(dispatch);
    expect(history.push).toHaveBeenCalledWith("/app/designer/saved_gardens");
    expect(dispatch).toHaveBeenCalledWith(unselectSavedGarden);
  });
});

describe("openSavedGarden", () => {
  it("opens garden", () => {
    const dispatch = jest.fn();
    const uuid = "SavedGardenUuid.1.0";
    openSavedGarden(uuid)(dispatch);
    expect(history.push).toHaveBeenCalledWith("/app/designer/saved_gardens/1");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_SAVED_GARDEN,
      payload: uuid
    });
  });
});

describe("openOrCloseGarden", () => {
  it("opens garden", () => {
    const props = {
      savedGarden: "SavedGardenUuid.1.0",
      dispatch: jest.fn(),
      gardenIsOpen: false,
    };
    openOrCloseGarden(props)();
    expect(history.push).toHaveBeenCalledWith("/app/designer/saved_gardens/1");
  });

  it("closes garden", () => {
    const props = {
      savedGarden: "SavedGardenUuid.1.0",
      dispatch: jest.fn(),
      gardenIsOpen: true,
    };
    openOrCloseGarden(props)();
    expect(history.push).toHaveBeenCalledWith("/app/designer/saved_gardens");
  });
});

describe("newSavedGarden", () => {
  it("creates a new saved garden", () => {
    newSavedGarden("my saved garden")(jest.fn());
    expect(initSave).toHaveBeenCalledWith(
      "SavedGarden", { name: "my saved garden" });
  });

  it("creates a new saved garden with default name", () => {
    newSavedGarden("")(jest.fn());
    expect(initSave).toHaveBeenCalledWith(
      "SavedGarden", { name: "Untitled Garden" });
  });
});

describe("copySavedGarden", () => {
  const fakeProps = () => {
    const fakeSG = fakeSavedGarden();
    fakeSG.body.id = 1;
    const fakePT = fakePlantTemplate();
    fakePT.body.saved_garden_id = fakeSG.body.id;
    return {
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
