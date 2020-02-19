jest.mock("../../../api/crud", () => ({
  save: jest.fn(),
  overwrite: jest.fn(),
  edit: jest.fn(),
}));

jest.mock("../../map/actions", () => ({ setHoveredPlant: jest.fn() }));

let mockDev = false;
jest.mock("../../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import React from "react";
import {
  GroupDetailActive, GroupDetailActiveProps
} from "../group_detail_active";
import { mount, shallow } from "enzyme";
import {
  fakePointGroup, fakePlant
} from "../../../__test_support__/fake_state/resources";
import { save, edit } from "../../../api/crud";
import { SpecialStatus } from "farmbot";
import { DEFAULT_CRITERIA } from "../criteria/interfaces";
import { Content } from "../../../constants";

describe("<GroupDetailActive/>", () => {
  const fakeProps = (): GroupDetailActiveProps => {
    const plant = fakePlant();
    plant.body.id = 1;
    const group = fakePointGroup();
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
    };
  };

  it("saves", () => {
    const p = fakeProps();
    const el = new GroupDetailActive(p);
    el.saveGroup();
    expect(p.dispatch).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(p.group.uuid);
  });

  it("renders", () => {
    const p = fakeProps();
    p.group.specialStatus = SpecialStatus.SAVED;
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.find("input").first().prop("defaultValue")).toContain("XYZ");
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
    mockDev = false;
    const p = fakeProps();
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("0m");
  });

  it("doesn't show paths", () => {
    mockDev = true;
    const p = fakeProps();
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("0m");
  });

  it("shows random warning text", () => {
    const p = fakeProps();
    p.group.body.sort_type = "random";
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.text()).toContain(Content.SORT_DESCRIPTION);
  });
});
