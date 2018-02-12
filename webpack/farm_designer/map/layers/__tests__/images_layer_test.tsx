import * as React from "react";
import { ImageLayer, ImageLayerProps } from "../image_layer";
import { shallow } from "enzyme";
import { fakeImage } from "../../../../__test_support__/fake_state/resources";

describe("<ImageLayer/>", () => {
  function fakeProps(): ImageLayerProps {
    return {
      visible: true,
      images: [fakeImage()],
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      cameraCalibrationData: {
        offset: { x: "0", y: "0" },
        origin: "TOP_LEFT",
        rotation: "0",
        scale: "1"
      },
      sizeOverride: { width: 10, height: 10 }
    };
  }

  it("shows images", () => {
    const p = fakeProps();
    const wrapper = shallow(<ImageLayer {...p } />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").html()).toContain("x=\"0\"");
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<ImageLayer {...p } />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });
});
