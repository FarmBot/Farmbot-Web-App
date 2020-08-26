let mockPath = "/app/designer";
jest.mock("../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));
const mockSyncThunk = jest.fn();
jest.mock("../devices/actions", () => ({ sync: () => mockSyncThunk }));
jest.mock("../farm_designer/map/actions", () => ({ unselectPlant: jest.fn() }));

import React from "react";
import { shallow } from "enzyme";
import { HotKeys, HotKeysProps, hotkeysWithActions } from "../hotkeys";
import { push } from "../history";
import { sync } from "../devices/actions";
import { unselectPlant } from "../farm_designer/map/actions";
import {
  showHotkeysDialog,
} from "@blueprintjs/core/lib/esm/components/hotkeys/hotkeysDialog";

describe("hotkeysWithActions()", () => {
  it("has key bindings", () => {
    mockPath = "/app/designer/nope";
    const dispatch = jest.fn();
    const hotkeys = hotkeysWithActions(dispatch);
    expect(hotkeys.length).toBe(8);
    const e = {} as KeyboardEvent;

    hotkeys[0].onKeyDown?.(e);
    expect(dispatch).toHaveBeenCalledWith(sync());

    hotkeys[1].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants");

    hotkeys[2].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/settings");

    hotkeys[3].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants/crop_search");

    hotkeys[4].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/events/add");

    hotkeys[5].onKeyDown?.(e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants");
    expect(unselectPlant).toHaveBeenCalled();

    hotkeys[6].onKeyDown?.(e);
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
