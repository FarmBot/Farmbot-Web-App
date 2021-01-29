let mockPath = "/app/designer";
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
import { HotKey, HotKeys, HotKeysProps, hotkeysWithActions } from "../hotkeys";
import { push } from "../history";
import { sync } from "../devices/actions";
import { unselectPlant } from "../farm_designer/map/actions";
import {
  showHotkeysDialog,
} from "@blueprintjs/core/lib/esm/components/hotkeys/hotkeysDialog";
import { save } from "../api/crud";

describe("hotkeysWithActions()", () => {
  it("has key bindings", () => {
    mockPath = "/app/designer/nope";
    const dispatch = jest.fn();
    const hotkeys = hotkeysWithActions(dispatch);
    expect(Object.values(hotkeys).length).toBe(9);
    const e = {} as KeyboardEvent;

    hotkeys[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    mockState.resources.consumers.sequences.current = "uuid";
    hotkeys[HotKey.save].onKeyDown?.(e);
    expect(save).not.toHaveBeenCalled();
    mockPath = "/app/designer/sequences/1";
    hotkeys[HotKey.save].onKeyDown?.(e);
    expect(save).toHaveBeenCalledWith("uuid");

    hotkeys[HotKey.sync].onKeyDown?.(e);
    expect(dispatch).toHaveBeenCalledWith(sync());

    hotkeys[HotKey.navigateRight].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants");

    hotkeys[HotKey.navigateLeft].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/settings");

    hotkeys[HotKey.addPlant].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants/crop_search");

    hotkeys[HotKey.addEvent].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/events/add");

    hotkeys[HotKey.backToPlantOverview].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants");
    expect(unselectPlant).toHaveBeenCalled();

    hotkeys[HotKey.openGuide].onKeyDown?.(e);
    expect(showHotkeysDialog).toHaveBeenCalled();
  });
});

describe("<HotKeys />", () => {
  const fakeProps = (): HotKeysProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = shallow(<HotKeys {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<div class=\"hotkeys\"></div>");
  });
});
