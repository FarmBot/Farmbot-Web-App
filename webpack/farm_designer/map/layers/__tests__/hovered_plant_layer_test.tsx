import * as React from "react";
import { HoveredPlantLayer, HoveredPlantLayerProps } from "../hovered_plant_layer";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";

describe("<HoveredPlantLayer/>", () => {
  function fakeProps(): HoveredPlantLayerProps {
    return {
      visible: true,
      dragging: false,
      currentPlant: undefined,
      designer: {
        selectedPlant: undefined,
        hoveredPlant: {
          plantUUID: undefined,
          icon: ""
        },
        cropSearchQuery: "",
        cropSearchResults: []
      },
      hoveredPlant: fakePlant(),
      isEditing: false,
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      }
    };
  }

  it("shows hovered plant icon", () => {
    const p = fakeProps();
    p.designer.hoveredPlant.icon = "fake icon";
    const wrapper = shallow(<HoveredPlantLayer {...p } />);
    const icon = wrapper.find("image").props();
    expect(icon.visibility).toBeTruthy();
    expect(icon.opacity).toEqual(1);
    expect(icon.x).toEqual(67.5);
    expect(icon.width).toEqual(65);
  });

  it("shows selected plant indicators", () => {
    const p = fakeProps();
    p.designer.hoveredPlant.icon = "fake icon";
    p.currentPlant = fakePlant();
    const wrapper = shallow(<HoveredPlantLayer {...p } />);
    expect(wrapper.find("#selected-plant-indicators").length).toEqual(1);
    expect(wrapper.find("Circle").length).toEqual(1);
    expect(wrapper.find("Circle").props().selected).toBeTruthy();
    expect(wrapper.find("SpreadCircle").length).toEqual(1);
    expect(wrapper.find("SpreadCircle").html())
      .toContain("cx=\"100\" cy=\"200\" r=\"125\"");
  });

  it("doesn't show hovered plant icon", () => {
    const p = fakeProps();
    const wrapper = shallow(<HoveredPlantLayer {...p } />);
    expect(wrapper.html()).toEqual("<g id=\"hovered-plant-layer\"></g>");
  });
});
