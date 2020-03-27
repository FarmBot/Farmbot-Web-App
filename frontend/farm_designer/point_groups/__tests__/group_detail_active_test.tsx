jest.mock("../../../api/crud", () => ({
  save: jest.fn(),
  overwrite: jest.fn(),
  edit: jest.fn(),
}));

jest.mock("../../map/actions", () => ({ setHoveredPlant: jest.fn() }));

import React from "react";
import {
  GroupDetailActive, GroupDetailActiveProps,
} from "../group_detail_active";
import { mount, shallow } from "enzyme";
import {
  fakePointGroup, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import { save, edit } from "../../../api/crud";
import { SpecialStatus } from "farmbot";
import { DEFAULT_CRITERIA } from "../criteria/interfaces";

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
      shouldDisplay: () => true,
      slugs: [],
      hovered: undefined,
      editGroupAreaInMap: false,
    };
  };

  it("saves", () => {
    const p = fakeProps();
    const el = new GroupDetailActive(p);
    el.saveGroup();
    expect(p.dispatch).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(p.group.uuid);
  });

  it("is already saved", () => {
    const p = fakeProps();
    p.group.specialStatus = SpecialStatus.SAVED;
    const el = new GroupDetailActive(p);
    el.saveGroup();
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

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
    expect(wrapper.find(".groups-list-wrapper").length).toEqual(1);
    expect(wrapper.text()).not.toContain("saving");
  });

  it("shows saving indicator", () => {
    const p = fakeProps();
    p.group.specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.text()).toContain("saving");
  });

  it("changes group name", () => {
    const NEW_NAME = "new group name";
    const wrapper = shallow(<GroupDetailActive {...fakeProps()} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: NEW_NAME }
    });
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { name: NEW_NAME });
  });

  it("changes the sort type", () => {
    const p = fakeProps();
    const { dispatch } = p;
    const el = new GroupDetailActive(p);
    el.changeSortType("random");
    expect(dispatch).toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith({
      body: {
        name: "XYZ",
        point_ids: [1],
        sort_type: "xy_ascending",
        group_type: [],
        criteria: DEFAULT_CRITERIA
      },
      kind: "PointGroup",
      specialStatus: "DIRTY",
      uuid: p.group.uuid,
    },
      { sort_type: "random" });
  });

  it("unmounts", () => {
    window.clearInterval = jest.fn();
    const p = fakeProps();
    const el = new GroupDetailActive(p);
    // tslint:disable-next-line:no-any
    el.state.timerId = 123 as any;
    el.componentWillUnmount && el.componentWillUnmount();
    expect(clearInterval).toHaveBeenCalledWith(123);
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
