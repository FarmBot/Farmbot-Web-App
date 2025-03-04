const mockSyncThunk = jest.fn();
jest.mock("../devices/actions", () => ({ sync: () => mockSyncThunk }));

import { fakeState } from "../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../redux/store", () => ({
  store: { getState: () => mockState, dispatch: jest.fn() },
}));

jest.mock("../api/crud", () => ({ save: jest.fn() }));

import React from "react";
import { shallow } from "enzyme";
import {
  HotKey, HotKeys, HotKeysProps, hotkeysWithActions, toggleHotkeyHelpOverlay,
} from "../hotkeys";
import { sync } from "../devices/actions";
import { save } from "../api/crud";
import { Actions } from "../constants";
import { Path } from "../internal_urls";
import { mockDispatch } from "../__test_support__/fake_dispatch";

describe("hotkeysWithActions()", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
  });

  it("has key bindings", () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const hotkeys = hotkeysWithActions(navigate, dispatch, "");
    expect(Object.values(hotkeys).length).toBe(8);
    const e = {} as KeyboardEvent;

    hotkeys[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    mockState.resources.consumers.sequences.current = "uuid";
    const hotkeysSettingsPath = hotkeysWithActions(navigate, dispatch, "settings");
    hotkeysSettingsPath[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    const hotkeysSequencesPath = hotkeysWithActions(
      navigate, dispatch, "sequences");
    hotkeysSequencesPath[HotKey.save].onKeyDown?.(e);
    expect(save).toHaveBeenCalledWith("uuid");

    hotkeys[HotKey.sync].onKeyDown?.(e);
    expect(dispatch).toHaveBeenCalledWith(sync());

    hotkeys[HotKey.navigateRight].onKeyDown?.(e);
    expect(navigate).toHaveBeenCalledWith(Path.plants());

    hotkeys[HotKey.navigateLeft].onKeyDown?.(e);
    expect(navigate).toHaveBeenCalledWith(Path.settings());

    hotkeys[HotKey.addPlant].onKeyDown?.(e);
    expect(navigate).toHaveBeenCalledWith(Path.cropSearch());

    hotkeys[HotKey.addEvent].onKeyDown?.(e);
    expect(navigate).toHaveBeenCalledWith(Path.farmEvents("add"));

    const hotkeysWithDispatch =
      hotkeysWithActions(navigate, mockDispatch(dispatch), "");
    hotkeysWithDispatch[HotKey.closePanel].onKeyDown?.(e);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: false,
    });
  });
});

describe("toggleHotkeyHelpOverlay()", () => {
  it("opens overlay", () => {
    const dispatch = jest.fn();
    toggleHotkeyHelpOverlay(dispatch)();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOTKEY_GUIDE, payload: undefined,
    });
  });
});

describe("<HotKeys />", () => {
  const fakeProps = (): HotKeysProps => ({
    dispatch: jest.fn(),
    hotkeyGuide: false,
  });

  it("renders", () => {
    location.pathname = Path.mock(Path.designer("nope"));
    const wrapper = shallow(<HotKeys {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<div class=\"hotkeys\"></div>");
  });

  it("renders default", () => {
    location.pathname = Path.mock(Path.designer());
    const wrapper = shallow(<HotKeys {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<div class=\"hotkeys\"></div>");
  });
});
