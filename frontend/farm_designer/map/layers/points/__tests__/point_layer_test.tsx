import * as React from "react";
import { PointLayer, PointLayerProps } from "../point_layer";
import { shallow } from "enzyme";
import { fakePoint } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

describe("<PointLayer/>", () => {
  function fakeProps(): PointLayerProps {
    return {
      visible: true,
      points: [fakePoint()],
      mapTransformProps: fakeMapTransformProps(),
    };
  }

  it("shows points", () => {
    const p = fakeProps();
    const wrapper = shallow(<PointLayer {...p} />);
    const layer = wrapper.find("#point-layer");
    expect(layer.find("GardenPoint").html()).toContain("r=\"100\"");
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<PointLayer {...p} />);
    const layer = wrapper.find("#point-layer");
    expect(layer.find("GardenPoint").length).toEqual(0);
  });
});
