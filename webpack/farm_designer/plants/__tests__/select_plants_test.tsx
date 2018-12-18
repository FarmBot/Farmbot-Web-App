jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

let mockPath = "";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => mockPath.split("/"))
}));

jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import { SelectPlants, SelectPlantsProps } from "../select_plants";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";
import { destroy } from "../../../api/crud";

describe("<SelectPlants />", () => {
  beforeEach(function () {
    mockPath = "/app/designer/plants/select";
  });

  function fakeProps(): SelectPlantsProps {
    const plant1 = fakePlant();
    plant1.uuid = "plant.1";
    plant1.body.name = "Strawberry";
    const plant2 = fakePlant();
    plant2.uuid = "plant.2";
    plant2.body.name = "Blueberry";
    return {
      selected: ["plant.1"],
      plants: [plant1, plant2],
      dispatch: jest.fn(),
    };
  }

  it("displays selected plant", () => {
    const wrapper = mount(<SelectPlants {...fakeProps()} />);
    expect(wrapper.text()).toContain("Strawberry");
  });

  it("displays multiple selected plants", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    ["Strawberry", "Blueberry", "Delete"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("displays no selected plants: selection empty", () => {
    const p = fakeProps();
    p.selected = [];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).not.toContain("Strawberry Plant");
  });

  it("displays no selected plants: selection invalid", () => {
    const p = fakeProps();
    p.selected = ["not a uuid"];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).not.toContain("Strawberry Plant");
  });

  it("selects all", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = mount(<SelectPlants {...p} />);
    clickButton(wrapper, 1, "select all");
    expect(p.dispatch).toHaveBeenCalledWith(
      { payload: ["plant.1", "plant.2"], type: Actions.SELECT_PLANT });
  });

  it("selects none", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = mount(<SelectPlants {...p} />);
    clickButton(wrapper, 2, "select none");
    expect(p.dispatch).toHaveBeenCalledWith(
      { payload: undefined, type: Actions.SELECT_PLANT });
  });

  it("confirms deletion of selected plants", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain("Delete");
    window.confirm = jest.fn();
    wrapper.find("button").first().simulate("click");
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete 2 plants?");
  });

  it("deletes selected plants", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain("Delete");
    window.confirm = () => true;
    wrapper.find("button").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith("plant.1", true);
    expect(destroy).toHaveBeenCalledWith("plant.2", true);
  });
});
