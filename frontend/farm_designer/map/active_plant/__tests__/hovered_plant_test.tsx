import * as React from "react";
import { HoveredPlant, HoveredPlantProps } from "../hovered_plant";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../../__test_support__/map_transform_props";
import {
  fakeDesignerState
} from "../../../../__test_support__/fake_designer_state";

describe("<HoveredPlant/>", () => {
  function fakeProps(): HoveredPlantProps {
    return {
      visible: true,
      spreadLayerVisible: false,
      dragging: false,
      currentPlant: undefined,
      designer: fakeDesignerState(),
      hoveredPlant: fakePlant(),
      isEditing: false,
      mapTransformProps: fakeMapTransformProps(),
      animate: false,
    };
  }

  it("shows hovered plant icon", () => {
    const p = fakeProps();
    p.designer.hoveredPlant.icon = "fake icon";
    const wrapper = shallow(<HoveredPlant {...p} />);
    const icon = wrapper.find("image").props();
    expect(icon.visibility).toBeTruthy();
    expect(icon.opacity).toEqual(1);
    expect(icon.x).toEqual(70);
    expect(icon.width).toEqual(60);
  });

  it("shows selected plant indicators", () => {
    const p = fakeProps();
    p.designer.hoveredPlant.icon = "fake icon";
    p.currentPlant = fakePlant();
    const wrapper = shallow(<HoveredPlant {...p} />);
    expect(wrapper.find("#selected-plant-indicators").length).toEqual(1);
    expect(wrapper.find("Circle").length).toEqual(1);
    expect(wrapper.find("Circle").props().selected).toBeTruthy();
    expect(wrapper.find("SpreadCircle").length).toEqual(1);
    expect(wrapper.find("SpreadCircle").html())
      .toContain("cx=\"100\" cy=\"200\" r=\"125\"");
  });

  it("doesn't show hovered plant icon", () => {
    const p = fakeProps();
    const wrapper = shallow(<HoveredPlant {...p} />);
    expect(wrapper.html()).toEqual("<g id=\"hovered-plant\"></g>");
  });
});
