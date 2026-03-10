import { fakeState } from "../__test_support__/fake_state";
const mockState = fakeState();

import React from "react";
import { render } from "@testing-library/react";
import {
  HotKey, HotKeys, HotKeysProps, hotkeysWithActions, HotkeysWithActionsProps,
  toggleHotkeyHelpOverlay,
} from "../hotkeys";
import * as deviceActions from "../devices/actions";
import * as crud from "../api/crud";
import { store } from "../redux/store";
import { Actions } from "../constants";
import { Path } from "../internal_urls";
import { mockDispatch } from "../__test_support__/fake_dispatch";
import {
  fakeDesignerState, fakeDrawnPoint,
} from "../__test_support__/fake_designer_state";
import { resetDrawnPointDataAction } from "../points/create_points";

let syncSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
const mockSyncThunk = jest.fn();
let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;

beforeEach(() => {
  mockState.resources.consumers.sequences.current = undefined;
  syncSpy = jest.spyOn(deviceActions, "sync")
    .mockImplementation(() => mockSyncThunk as never);
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
});

afterEach(() => {
  syncSpy.mockRestore();
  saveSpy.mockRestore();
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
});

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
    expect(crud.save).not.toHaveBeenCalled();
    mockState.resources.consumers.sequences.current = "uuid";
    p.slug = "settings";
    const hotkeysSettingsPath = hotkeysWithActions(p);
    hotkeysSettingsPath[HotKey.save].onKeyDown?.(e);
    expect(crud.save).not.toHaveBeenCalled();
    p.slug = "sequences";
    const hotkeysSequencesPath = hotkeysWithActions(p);
    hotkeysSequencesPath[HotKey.save].onKeyDown?.(e);
    expect(crud.save).toHaveBeenCalledWith("uuid");

    hotkeys[HotKey.sync].onKeyDown?.(e);
    expect(p.dispatch).toHaveBeenCalledWith(deviceActions.sync());

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
      expect.objectContaining({
        key: "?",
        shiftKey: true,
        bubbles: true,
      }),
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
    const { container } = render(<HotKeys {...fakeProps()} />);
    expect(container.querySelectorAll("div").length).toEqual(1);
  });

  it("renders default", () => {
    location.pathname = Path.mock(Path.designer());
    const { container } = render(<HotKeys {...fakeProps()} />);
    expect(container.querySelectorAll("div").length).toEqual(1);
  });
});
