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
  HotKey, HotKeys, HotKeysProps, hotkeysWithActions, HotkeysWithActionsProps,
  toggleHotkeyHelpOverlay,
} from "../hotkeys";
import { sync } from "../devices/actions";
import { save } from "../api/crud";
import { Actions } from "../constants";
import { Path } from "../internal_urls";
import { mockDispatch } from "../__test_support__/fake_dispatch";
import {
  fakeDesignerState, fakeDrawnPoint,
} from "../__test_support__/fake_designer_state";
import { resetDrawnPointDataAction } from "../points/create_points";

describe("hotkeysWithActions()", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
  });

  const fakeProps = (): HotkeysWithActionsProps => ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
    designer: fakeDesignerState(),
    slug: "",
  });

  it("has key bindings", () => {
    const p = fakeProps();
    const hotkeys = hotkeysWithActions(p);
    expect(Object.values(hotkeys).length).toBe(8);
    const e = {} as KeyboardEvent;

    hotkeys[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    mockState.resources.consumers.sequences.current = "uuid";
    p.slug = "settings";
    const hotkeysSettingsPath = hotkeysWithActions(p);
    hotkeysSettingsPath[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    p.slug = "sequences";
    const hotkeysSequencesPath = hotkeysWithActions(p);
    hotkeysSequencesPath[HotKey.save].onKeyDown?.(e);
    expect(save).toHaveBeenCalledWith("uuid");

    hotkeys[HotKey.sync].onKeyDown?.(e);
    expect(p.dispatch).toHaveBeenCalledWith(sync());

    hotkeys[HotKey.navigateRight].onKeyDown?.(e);
    expect(p.navigate).toHaveBeenCalledWith(Path.plants());

    hotkeys[HotKey.navigateLeft].onKeyDown?.(e);
    expect(p.navigate).toHaveBeenCalledWith(Path.settings());

    hotkeys[HotKey.addPlant].onKeyDown?.(e);
    expect(p.navigate).toHaveBeenCalledWith(Path.cropSearch());

    hotkeys[HotKey.addEvent].onKeyDown?.(e);
    expect(p.navigate).toHaveBeenCalledWith(Path.farmEvents("add"));

    p.slug = "";
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const hotkeysWithDispatch = hotkeysWithActions(p);
    hotkeysWithDispatch[HotKey.closePanel].onKeyDown?.(e);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: false,
    });

    p.dispatch = jest.fn();
    const point = fakeDrawnPoint();
    point.cx = 1;
    p.designer.drawnPoint = point;
    const hotkeysWithDrawnPoint = hotkeysWithActions(p);
    hotkeysWithDrawnPoint[HotKey.closePanel].onKeyDown?.(e);
    expect(p.dispatch).toHaveBeenCalledWith(resetDrawnPointDataAction());
  });
});

describe("toggleHotkeyHelpOverlay()", () => {
  it("opens overlay", () => {
    document.dispatchEvent = jest.fn();
    toggleHotkeyHelpOverlay();
    expect(document.dispatchEvent).toHaveBeenCalledWith(
      new KeyboardEvent("keydown", { key: "?", shiftKey: true, bubbles: true }),
    );
  });
});

describe("<HotKeys />", () => {
  const fakeProps = (): HotKeysProps => ({
    dispatch: jest.fn(),
    designer: fakeDesignerState(),
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
