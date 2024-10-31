jest.mock("../actions", () => ({
  applyGarden: jest.fn(),
  destroySavedGarden: jest.fn(),
  openOrCloseGarden: jest.fn(),
  closeSavedGarden: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { RawEditGarden as EditGarden, mapStateToProps } from "../garden_edit";
import { EditGardenProps } from "../interfaces";
import {
  fakePlantTemplate, fakeSavedGarden,
} from "../../__test_support__/fake_state/resources";
import { clickButton } from "../../__test_support__/helpers";
import { applyGarden, destroySavedGarden } from "../actions";
import { error } from "../../toast/toast";
import { edit } from "../../api/crud";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Path } from "../../internal_urls";
import { times } from "lodash";

describe("<EditGarden />", () => {
  const fakeProps = (): EditGardenProps => ({
    savedGarden: undefined,
    gardenIsOpen: false,
    dispatch: jest.fn(),
    plantPointerCount: 0,
    gardenPlants: [fakePlantTemplate()],
  });

  it("edits garden name", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    const wrapper = shallow(<EditGarden {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "new name" } });
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { name: "new name" });
  });

  it("edits garden notes", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    const wrapper = shallow(<EditGarden {...p} />);
    wrapper.find("textarea").simulate("change",
      { currentTarget: { value: "notes" } });
    wrapper.find("textarea").simulate("blur");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { notes: "notes" });
  });

  it("applies garden", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.savedGarden.body.id = 1;
    p.plantPointerCount = 0;
    const wrapper = mount(<EditGarden {...p} />);
    clickButton(wrapper, 0, "apply");
    expect(applyGarden).toHaveBeenCalledWith(expect.any(Function), 1);
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
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroySavedGarden).toHaveBeenCalledWith(expect.any(Function),
      p.savedGarden.uuid);
  });

  it("shows garden not found", () => {
    location.pathname = Path.mock(Path.savedGardens("nope"));
    const wrapper = mount(<EditGarden {...fakeProps()} />);
    expect(wrapper.text()).toContain("not found");
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<EditGarden {...fakeProps()} />);
    expect(wrapper.text()).toContain("not found");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows when garden is open", () => {
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

  it("expands", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.gardenPlants = times(100, fakePlantTemplate);
    const wrapper = mount(<EditGarden {...p} />);
    expect(wrapper.find(".group-item-icon").length).toEqual(63);
    wrapper.find(".more-indicator").simulate("click");
    expect(wrapper.find(".group-item-icon").length).toEqual(100);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const sg = fakeSavedGarden();
    sg.body.id = 1;
    location.pathname = Path.mock(Path.savedGardens(1));
    const state = fakeState();
    state.resources = buildResourceIndex([sg, fakePlantTemplate()]);
    state.resources.consumers.farm_designer.openedSavedGarden = sg.body.id;
    const props = mapStateToProps(state);
    expect(props.gardenIsOpen).toEqual(true);
    expect(props.savedGarden).toEqual(sg);
  });

  it("doesn't find saved garden", () => {
    const sg = fakeSavedGarden();
    sg.body.id = 1;
    location.pathname = Path.mock(Path.savedGardens());
    const state = fakeState();
    state.resources = buildResourceIndex([sg, fakePlantTemplate()]);
    state.resources.consumers.farm_designer.openedSavedGarden = sg.body.id;
    const props = mapStateToProps(state);
    expect(props.gardenIsOpen).toEqual(false);
    expect(props.savedGarden).toEqual(undefined);
  });
});
