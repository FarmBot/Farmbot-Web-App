import * as React from "react";
import { HoveredPlantLayer, HoveredPlantLayerProps } from "../hovered_plant_layer";
import { shallow } from "enzyme";

describe("<HoveredPlantLayer/>", () => {
  function fakeProps(): HoveredPlantLayerProps {
    return {
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
      hoveredPlant: undefined,
      dispatch: jest.fn(),
      isEditing: false,
      mapTransformProps: {
        quadrant: 1, gridSize: { x: 3000, y: 1500 }
      }
    };
  }

  it("shows hovered plant icon", () => {
    const p = fakeProps();
    const wrapper = shallow(<HoveredPlantLayer {...p } />);
    wrapper.setState({ isHovered: true });
    const icon = wrapper.find("image");
    expect(icon.props().style).toEqual({ "transform": "scale(1.3, 1.3)" });
  });

  it("doesn't show hovered plant icon", () => {
    const p = fakeProps();
    const wrapper = shallow(<HoveredPlantLayer {...p } />);
    const icon = wrapper.find("image").props();
    expect(icon.style).toEqual({ "transform": "scale(1, 1)" });
  });
});
