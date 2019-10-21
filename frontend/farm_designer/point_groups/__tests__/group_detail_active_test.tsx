jest.mock("../../../api/crud", () => ({
  save: jest.fn(),
  overwrite: jest.fn(),
  edit: jest.fn(),
}));

jest.mock("../../actions", () => ({
  toggleHoveredPlant: jest.fn()
}));

import React from "react";
import { GroupDetailActive } from "../group_detail_active";
import { mount, shallow } from "enzyme";
import {
  fakePointGroup, fakePlant
} from "../../../__test_support__/fake_state/resources";
import { save, edit } from "../../../api/crud";
import { SpecialStatus } from "farmbot";

describe("<GroupDetailActive/>", () => {
  function fakeProps() {
    const plant = fakePlant();
    plant.body.id = 1;
    const plants = [plant];
    const group = fakePointGroup();
    group.specialStatus = SpecialStatus.DIRTY;
    group.body.name = "XYZ";
    group.body.point_ids = [plant.body.id];
    return { dispatch: jest.fn(), group, plants };
  }

  it("saves", () => {
    const p = fakeProps();
    const { dispatch } = p;
    const el = new GroupDetailActive(p);
    el.saveGroup();
    expect(dispatch).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(p.group.uuid);
  });

  it("renders", () => {
    const props = fakeProps();
    const el = mount(<GroupDetailActive {...props} />);
    expect(el.find("input").prop("defaultValue")).toContain("XYZ");
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
});
