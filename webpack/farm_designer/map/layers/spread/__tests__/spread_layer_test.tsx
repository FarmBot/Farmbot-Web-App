import * as React from "react";
import { SpreadLayer, SpreadLayerProps } from "../spread_layer";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

describe("<SpreadLayer/>", () => {
  function fakeProps(): SpreadLayerProps {
    return {
      visible: true,
      plants: [fakePlant()],
      currentPlant: undefined,
      mapTransformProps: fakeMapTransformProps(),
      dragging: false,
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      activeDragSpread: undefined,
      editing: false,
      animate: false,
    };
  }

  it("shows spread", () => {
    const p = fakeProps();
    const wrapper = shallow(<SpreadLayer {...p} />);
    const layer = wrapper.find("#spread-layer");
    expect(layer.find("SpreadCircle").html()).toContain("r=\"125\"");
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<SpreadLayer {...p} />);
    const layer = wrapper.find("#spread-layer");
    expect(layer.find("SpreadCircle").length).toEqual(0);
  });
});
