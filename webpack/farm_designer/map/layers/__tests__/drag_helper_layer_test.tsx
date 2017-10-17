import * as React from "react";
import { DragHelperLayer, DragHelperLayerProps } from "../drag_helper_layer";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";

describe("<DragHelperLayer/>", () => {
  function fakeProps(): DragHelperLayerProps {
    return {
      currentPlant: fakePlant(),
      editing: true,
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      dragging: true,
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  it("shows drag helpers", () => {
    const p = fakeProps();
    const wrapper = shallow(<DragHelperLayer {...p } />);
    ["drag-helpers",
      "coordinates-tooltip",
      "long-crosshair",
      "short-crosshair"].map(string =>
        expect(wrapper.html()).toContain(string));
  });

  it("doesn't show drag helpers", () => {
    const p = fakeProps();
    p.editing = false;
    const wrapper = shallow(<DragHelperLayer {...p } />);
    expect(wrapper.html()).toEqual("<g id=\"drag-helper-layer\"></g>");
  });
});
