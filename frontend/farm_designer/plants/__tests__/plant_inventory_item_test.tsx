jest.mock("../../../open_farm/cached_crop", () => ({
  maybeGetCachedPlantIcon: jest.fn(),
}));

jest.mock("../../../history", () => ({ push: jest.fn() }));

import * as React from "react";
import {
  PlantInventoryItem, PlantInventoryItemProps,
} from "../plant_inventory_item";
import { shallow, mount } from "enzyme";
import {
  fakePlant, fakePlantTemplate,
} from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import { push } from "../../../history";
import { maybeGetCachedPlantIcon } from "../../../open_farm/cached_crop";

describe("<PlantInventoryItem />", () => {
  const fakeProps = (): PlantInventoryItemProps => ({
    plant: fakePlant(),
    dispatch: jest.fn(),
    hovered: false,
  });

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
        plantUUID: p.plant.uuid
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
      payload: [p.plant.uuid],
      type: Actions.SELECT_PLANT
    });
    expect(push).toHaveBeenCalledWith("/app/designer/plants/" + p.plant.body.id);
  });

  it("selects plant template", () => {
    const p = fakeProps();
    p.plant = fakePlantTemplate();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(p.dispatch).toBeCalledWith({
      payload: [p.plant.uuid],
      type: Actions.SELECT_PLANT
    });
    expect(push).toHaveBeenCalledWith(
      "/app/designer/gardens/templates/" + p.plant.body.id);
  });

  it("gets cached icon", () => {
    const wrapper =
      mount<PlantInventoryItem>(<PlantInventoryItem {...fakeProps()} />);
    const img = wrapper.find("img");
    img.simulate("load");
    expect(maybeGetCachedPlantIcon).toHaveBeenCalledWith("strawberry",
      img.instance(), expect.any(Function));
  });
});
