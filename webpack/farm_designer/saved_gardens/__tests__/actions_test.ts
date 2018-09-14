jest.mock("axios", () => ({
  default: {
    post: jest.fn(() => Promise.resolve()),
    patch: jest.fn(() => Promise.resolve()),
  }
}));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

import { API } from "../../../api";
import axios from "axios";
import {
  snapshotGarden, applyGarden, destroySavedGarden, closeSavedGarden,
  openSavedGarden, openOrCloseGarden
} from "../actions";
import { history } from "../../../history";
import { Actions } from "../../../constants";
import { destroy } from "../../../api/crud";

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
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_SAVED_GARDEN,
      payload: undefined
    });
  });
});

describe("destroySavedGarden", () => {
  it("deletes garden", () => {
    const dispatch = jest.fn(() => Promise.resolve());
    destroySavedGarden("SavedGardenUuid")(dispatch);
    expect(destroy).toHaveBeenCalledWith("SavedGardenUuid");
  });
});

describe("closeSavedGarden", () => {
  it("closes garden", () => {
    const dispatch = jest.fn();
    closeSavedGarden()(dispatch);
    expect(history.push).toHaveBeenCalledWith("/app/designer/saved_gardens");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_SAVED_GARDEN,
      payload: undefined
    });
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
