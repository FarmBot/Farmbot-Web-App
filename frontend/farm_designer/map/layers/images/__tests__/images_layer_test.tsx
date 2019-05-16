import * as React from "react";
import { ImageLayer, ImageLayerProps } from "../image_layer";
import { shallow } from "enzyme";
import {
  fakeImage, fakeWebAppConfig
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

const mockConfig = fakeWebAppConfig();
jest.mock("../../../../../resources/selectors", () => {
  return {
    getWebAppConfig: () => mockConfig,
    assertUuid: jest.fn()
  };
});

describe("<ImageLayer/>", () => {
  function fakeProps(): ImageLayerProps {
    const image = fakeImage();
    image.body.meta.z = 0;
    image.body.meta.name = "rotated_image";
    return {
      visible: true,
      images: [image],
      mapTransformProps: fakeMapTransformProps(),
      cameraCalibrationData: {
        offset: { x: undefined, y: undefined },
        origin: undefined,
        rotation: undefined,
        scale: undefined,
        calibrationZ: undefined,
      },
      imageFilterBegin: "",
      imageFilterEnd: "",
    };
  }

  it("shows images", () => {
    const p = fakeProps();
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").html()).toContain("image");
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });

  it("filters old images", () => {
    const p = fakeProps();
    p.images[0].body.created_at = "2018-01-22T05:00:00.000Z";
    p.imageFilterBegin = "2018-01-23T05:00:00.000Z";
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });
});
