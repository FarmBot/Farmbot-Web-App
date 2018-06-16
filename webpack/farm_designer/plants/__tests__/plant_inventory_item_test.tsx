jest.mock("../../../history", () => ({ push: jest.fn() }));

import * as React from "react";
import { PlantInventoryItem } from "../plant_inventory_item";
import { shallow } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import { push } from "../../../history";

describe("<PlantInventoryItem />", () => {
  const fakeProps = () => {
    return {
      tpp: fakePlant(),
      dispatch: jest.fn(),
      hovered: false,
    };
  };

  it("renders", () => {
    const wrapper = shallow(<PlantInventoryItem {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Strawberry Plant 11 days old");
    expect(wrapper.find("div").first().hasClass("hovered")).toBeFalsy();
  });

  it("renders hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    expect(wrapper.find("div").first().hasClass("hovered")).toBeTruthy();
  });

  it("hover begin", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("mouseEnter");
    expect(p.dispatch).toBeCalledWith({
      payload: {
        icon: "",
        plantUUID: p.tpp.uuid
      },
      type: Actions.TOGGLE_HOVERED_PLANT
    });
  });

  it("hover end", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("mouseLeave");
    expect(p.dispatch).toBeCalledWith({
      payload: {
        icon: "",
        plantUUID: undefined
      },
      type: Actions.TOGGLE_HOVERED_PLANT
    });
  });

  it("selects plant", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(p.dispatch).toBeCalledWith({
      payload: [p.tpp.uuid],
      type: Actions.SELECT_PLANT
    });
    expect(push).toHaveBeenCalledWith("/app/designer/plants/" + p.tpp.body.id);
  });
});
