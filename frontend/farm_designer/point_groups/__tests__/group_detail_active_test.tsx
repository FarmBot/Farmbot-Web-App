jest.mock("../../../api/crud", () => ({
  save: jest.fn(),
  overwrite: jest.fn(),
  edit: jest.fn(),
}));

jest.mock("../../actions", () => ({
  toggleHoveredPlant: jest.fn()
}));

import React from "react";
import { GroupDetailActive, LittleIcon } from "../group_detail_active";
import { mount, shallow } from "enzyme";
import {
  fakePointGroup, fakePlant
} from "../../../__test_support__/fake_state/resources";
import { save, overwrite, edit } from "../../../api/crud";
import { toggleHoveredPlant } from "../../actions";
import { DEFAULT_ICON } from "../../../open_farm/icons";
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
  const icon = "doge.jpg";

  it("removes points onClick", () => {
    const { plants, dispatch, group } = fakeProps();
    const el = shallow(<LittleIcon
      plant={plants[0]}
      group={group}
      dispatch={dispatch}
      icon="doge.jpg" />);
    el.simulate("click");
    const emptyGroup = expect.objectContaining({
      name: "XYZ",
      point_ids: []
    });
    expect(overwrite).toHaveBeenCalledWith(group, emptyGroup);
    expect(dispatch).toHaveBeenCalled();
  });

  it("toggles onMouseEnter", () => {
    const { plants, dispatch, group } = fakeProps();
    const plant = plants[0];
    const el = shallow(<LittleIcon
      plant={plant}
      group={group}
      dispatch={dispatch}
      icon={icon} />);
    el.simulate("mouseEnter");
    expect(toggleHoveredPlant).toHaveBeenCalledWith(plant.uuid, icon);
  });

  it("toggled onMouseLeave", () => {
    const { plants, dispatch, group } = fakeProps();
    const plant = plants[0];
    const el = shallow(<LittleIcon
      plant={plant}
      group={group}
      dispatch={dispatch}
      icon={icon} />);
    el.simulate("mouseLeave");
    expect(toggleHoveredPlant).toHaveBeenCalledWith(undefined, icon);
  });

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

  it("provides the DEFAULT_ICON when OF has no icon to provide", () => {
    const plant = fakePlant();
    const comp = new GroupDetailActive(fakeProps());
    comp.state = {
      [plant.uuid]: {
        slug: plant.uuid,
        svg_icon: undefined
      }
    };
    const result = comp.findIcon(plant);
    expect(result).toEqual(DEFAULT_ICON);
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
      uuid: "PointGroup.0.16",
    },
      { sort_type: "random" });
  });
});
