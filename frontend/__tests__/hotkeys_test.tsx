import { Path } from "../internal_urls";
let mockPath = Path.mock(Path.designer());
jest.mock("../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));
const mockSyncThunk = jest.fn();
jest.mock("../devices/actions", () => ({ sync: () => mockSyncThunk }));
jest.mock("../farm_designer/map/actions", () => ({ unselectPlant: jest.fn() }));

import { fakeState } from "../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../redux/store", () => ({
  store: { getState: () => mockState, dispatch: jest.fn() },
}));

jest.mock("../api/crud", () => ({ save: jest.fn() }));

import React from "react";
import { shallow } from "enzyme";
import {
  HotKey, HotKeys, HotKeysProps, hotkeysWithActions, openHotkeyHelpOverlay,
} from "../hotkeys";
import { push } from "../history";
import { sync } from "../devices/actions";
import { unselectPlant } from "../farm_designer/map/actions";
import {
  showHotkeysDialog,
} from "@blueprintjs/core/lib/esm/components/hotkeys/hotkeysDialog";
import { save } from "../api/crud";

describe("hotkeysWithActions()", () => {
  it("has key bindings", () => {
    const dispatch = jest.fn();
    const hotkeys = hotkeysWithActions(dispatch, "");
    expect(Object.values(hotkeys).length).toBe(8);
    const e = {} as KeyboardEvent;

    hotkeys[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    mockState.resources.consumers.sequences.current = "uuid";
    const hotkeysSettingsPath = hotkeysWithActions(dispatch, "settings");
    hotkeysSettingsPath[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    const hotkeysSequencesPath = hotkeysWithActions(dispatch, "sequences");
    hotkeysSequencesPath[HotKey.save].onKeyDown?.(e);
    expect(save).toHaveBeenCalledWith("uuid");

    hotkeys[HotKey.sync].onKeyDown?.(e);
    expect(dispatch).toHaveBeenCalledWith(sync());

    hotkeys[HotKey.navigateRight].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith(Path.plants());

    hotkeys[HotKey.navigateLeft].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith(Path.settings());

    hotkeys[HotKey.addPlant].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith(Path.cropSearch());

    hotkeys[HotKey.addEvent].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith(Path.farmEvents("add"));

    hotkeysSettingsPath[HotKey.backToPlantOverview].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith(Path.plants());
    expect(unselectPlant).toHaveBeenCalled();
    jest.clearAllMocks();
    const hotkeysPhotosPath = hotkeysWithActions(dispatch, "photos");
    hotkeysPhotosPath[HotKey.backToPlantOverview].onKeyDown?.(e);
    expect(push).not.toHaveBeenCalled();
    expect(unselectPlant).not.toHaveBeenCalled();
  });
});

describe("openHotkeyHelpOverlay()", () => {
  it("opens overlay", () => {
    openHotkeyHelpOverlay();
    expect(showHotkeysDialog).toHaveBeenCalled();
  });
});

describe("<HotKeys />", () => {
  const fakeProps = (): HotKeysProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    mockPath = Path.mock(Path.designer("nope"));
    const wrapper = shallow(<HotKeys {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<div class=\"hotkeys\"></div>");
  });

  it("renders default", () => {
    mockPath = Path.mock(Path.designer());
    const wrapper = shallow(<HotKeys {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<div class=\"hotkeys\"></div>");
  });
});
