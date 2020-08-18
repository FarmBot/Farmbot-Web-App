jest.mock("../../api/crud", () => ({
  save: jest.fn(),
  overwrite: jest.fn(),
  edit: jest.fn(),
}));

jest.mock("../../farm_designer/map/actions", () => ({
  setHoveredPlant: jest.fn(),
}));

jest.mock("../../plants/select_plants", () => ({
  setSelectionPointType: jest.fn(),
  validPointTypes: jest.fn(),
  POINTER_TYPE_LIST: () => [],
}));

import React from "react";
import {
  GroupDetailActive, GroupDetailActiveProps,
} from "../group_detail_active";
import { mount, shallow } from "enzyme";
import {
  fakePointGroup, fakePlant,
} from "../../__test_support__/fake_state/resources";
import { edit } from "../../api/crud";
import { SpecialStatus } from "farmbot";
import { DEFAULT_CRITERIA } from "../criteria/interfaces";
import { setSelectionPointType } from "../../plants/select_plants";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";

describe("<GroupDetailActive/>", () => {
  const fakeProps = (): GroupDetailActiveProps => {
    const plant = fakePlant();
    plant.body.id = 1;
    const group = fakePointGroup();
    group.body.criteria = DEFAULT_CRITERIA;
    group.specialStatus = SpecialStatus.DIRTY;
    group.body.name = "XYZ";
    group.body.point_ids = [plant.body.id];
    return {
      dispatch: jest.fn(),
      group,
      allPoints: [],
      slugs: [],
      hovered: undefined,
      editGroupAreaInMap: false,
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true },
      },
      selectionPointType: undefined,
      tools: [],
      toolTransformProps: fakeToolTransformProps(),
    };
  };

  it("toggles icon view", () => {
    const p = fakeProps();
    const wrapper = mount<GroupDetailActive>(<GroupDetailActive {...p} />);
    expect(wrapper.state().iconDisplay).toBeTruthy();
    wrapper.instance().toggleIconShow();
    expect(wrapper.state().iconDisplay).toBeFalsy();
  });

  it("renders", () => {
    const p = fakeProps();
    p.group.specialStatus = SpecialStatus.SAVED;
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.find("input").first().prop("defaultValue")).toContain("XYZ");
    expect(wrapper.find(".group-member-display").length).toEqual(1);
  });

  it("unmounts", () => {
    const p = fakeProps();
    p.group.body.criteria.string_eq.pointer_type = ["Weed"];
    const wrapper = mount(<GroupDetailActive {...p} />);
    wrapper.unmount();
    expect(setSelectionPointType).toHaveBeenCalledWith(undefined);
  });

  it("changes group name", () => {
    const p = fakeProps();
    const wrapper = shallow(<GroupDetailActive {...p} />);
    wrapper.find("input").first().simulate("blur", {
      currentTarget: { value: "new group name" }
    });
    expect(edit).toHaveBeenCalledWith(p.group, { name: "new group name" });
  });

  it("shows paths", () => {
    const p = fakeProps();
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("0m");
  });

  it("shows random warning text", () => {
    const p = fakeProps();
    p.group.body.sort_type = "random";
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.html()).toContain("exclamation-triangle");
  });

  it("doesn't show icons", () => {
    const wrapper = mount(<GroupDetailActive {...fakeProps()} />);
    wrapper.setState({ iconDisplay: false });
    expect(wrapper.find(".groups-list-wrapper").length).toEqual(0);
  });
});
