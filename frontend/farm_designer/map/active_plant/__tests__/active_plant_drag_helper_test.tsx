import * as React from "react";
import { ActivePlantDragHelper } from "../active_plant_drag_helper";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../../__test_support__/map_transform_props";
import { ActivePlantDragHelperProps } from "../../interfaces";

describe("<ActivePlantDragHelper/>", () => {
  function fakeProps(): ActivePlantDragHelperProps {
    return {
      currentPlant: fakePlant(),
      editing: true,
      mapTransformProps: fakeMapTransformProps(),
      dragging: true,
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  it("shows drag helpers", () => {
    const p = fakeProps();
    const wrapper = shallow(<ActivePlantDragHelper {...p} />);
    ["drag-helpers",
      "coordinates-tooltip",
      "long-crosshair",
      "short-crosshair"].map(string =>
        expect(wrapper.html()).toContain(string));
  });

  it("doesn't show drag helpers", () => {
    const p = fakeProps();
    p.editing = false;
    const wrapper = shallow(<ActivePlantDragHelper {...p} />);
    expect(wrapper.html()).toEqual("<g id=\"active-plant-drag-helper\"></g>");
  });
});
