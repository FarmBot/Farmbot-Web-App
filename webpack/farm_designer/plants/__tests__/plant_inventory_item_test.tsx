import * as React from "react";
import { PlantInventoryItem } from "../plant_inventory_item";
import { shallow } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";

describe("<PlantInventoryItem />", () => {
  it("renders", () => {
    const wrapper = shallow(
      <PlantInventoryItem
        tpp={fakePlant()}
        dispatch={jest.fn()} />);
    expect(wrapper.text()).toEqual("Strawberry Plant 11 days old");
  });

  it("hover begin", () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <PlantInventoryItem
        tpp={fakePlant()}
        dispatch={dispatch} />);
    wrapper.simulate("mouseEnter");
    expect(dispatch).toBeCalledWith({
      payload: {
        icon: "",
        plantUUID: "points.1.17"
      },
      type: Actions.TOGGLE_HOVERED_PLANT
    });
  });

  it("hover end", () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <PlantInventoryItem
        tpp={fakePlant()}
        dispatch={dispatch} />);
    wrapper.simulate("mouseLeave");
    expect(dispatch).toBeCalledWith({
      payload: {
        icon: "",
        plantUUID: undefined
      },
      type: Actions.TOGGLE_HOVERED_PLANT
    });
  });
});
