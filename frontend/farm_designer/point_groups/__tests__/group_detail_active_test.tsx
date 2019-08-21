jest.mock("../../../api/crud", () => {
  return {
    save: jest.fn(),
    overwrite: jest.fn()
  };
});

import React from "react";
import { GroupDetailActive, LittleIcon } from "../group_detail_active";
import { mount, shallow } from "enzyme";
import { fakePointGroup, fakePlant } from "../../../__test_support__/fake_state/resources";
import { save, overwrite } from "../../../api/crud";

describe("<GroupDetailActive/>", () => {
  function fakeProps() {
    const plant = fakePlant();
    plant.body.id = 1;
    const plants = [plant];
    const group = fakePointGroup();
    group.body.name = "XYZ";
    group.body.point_ids = [plant.body.id];
    return { dispatch: jest.fn(), group, plants };
  }

  it("removes points onClick", () => {
    const { plants, dispatch, group } = fakeProps();
    const el = shallow(<LittleIcon
      plant={plants[0]}
      group={group}
      dispatch={dispatch}
      icon="doge.jpg"
    />);
    el.simulate("click");
    const emptyGroup = expect.objectContaining({
      name: "XYZ",
      point_ids: []
    });
    expect(overwrite).toHaveBeenCalledWith(group, emptyGroup);
    expect(dispatch).toHaveBeenCalled();
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
});
