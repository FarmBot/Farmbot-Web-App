jest.mock("../actions", () => ({
  applyGarden: jest.fn(),
  destroySavedGarden: jest.fn(),
  openOrCloseGarden: jest.fn(),
  closeSavedGarden: jest.fn(),
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

let mockPath = "";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { RawEditGarden as EditGarden, mapStateToProps } from "../garden_edit";
import { EditGardenProps } from "../interfaces";
import { fakeSavedGarden } from "../../../__test_support__/fake_state/resources";
import { clickButton } from "../../../__test_support__/helpers";
import { applyGarden, destroySavedGarden } from "../actions";
import { error } from "../../../toast/toast";
import { edit } from "../../../api/crud";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";

describe("<EditGarden />", () => {
  const fakeProps = (): EditGardenProps => ({
    savedGarden: undefined,
    gardenIsOpen: false,
    dispatch: jest.fn(),
    plantPointerCount: 0,
  });

  it("edits garden name", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    const wrapper = shallow(<EditGarden {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "new name" } });
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { name: "new name" });
  });

  it("applies garden", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.savedGarden.body.id = 1;
    p.plantPointerCount = 0;
    const wrapper = mount(<EditGarden {...p} />);
    clickButton(wrapper, 0, "apply");
    expect(applyGarden).toHaveBeenCalledWith(1);
  });

  it("plants still in garden", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.plantPointerCount = 1;
    const wrapper = mount(<EditGarden {...p} />);
    clickButton(wrapper, 0, "apply");
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Please clear current garden first"));
  });

  it("destroys garden", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    const wrapper = mount(<EditGarden {...p} />);
    clickButton(wrapper, 1, "delete");
    expect(destroySavedGarden).toHaveBeenCalledWith(p.savedGarden.uuid);
  });

  it("shows garden not found", () => {
    const wrapper = mount(<EditGarden {...fakeProps()} />);
    expect(wrapper.text()).toContain("not found");
  });

  it("show when garden is open", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.gardenIsOpen = true;
    const wrapper = mount(<EditGarden {...p} />);
    expect(wrapper.text()).toContain("exit");
  });

  it("renders with missing data", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.savedGarden.body.id = undefined;
    p.savedGarden.body.name = undefined;
    const wrapper = mount(<EditGarden {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("edit garden");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const sg = fakeSavedGarden();
    sg.body.id = 1;
    mockPath = "/app/designer/gardens/1";
    const state = fakeState();
    state.resources = buildResourceIndex([sg]);
    state.resources.consumers.farm_designer.openedSavedGarden = sg.uuid;
    const props = mapStateToProps(state);
    expect(props.gardenIsOpen).toEqual(true);
    expect(props.savedGarden).toEqual(sg);
  });

  it("doesn't find saved garden", () => {
    const sg = fakeSavedGarden();
    sg.body.id = 1;
    mockPath = "/app/designer/gardens/";
    const state = fakeState();
    state.resources = buildResourceIndex([sg]);
    state.resources.consumers.farm_designer.openedSavedGarden = sg.uuid;
    const props = mapStateToProps(state);
    expect(props.gardenIsOpen).toEqual(false);
    expect(props.savedGarden).toEqual(undefined);
  });
});
