import React from "react";
import { ImageLayer, ImageLayerProps } from "../image_layer";
import { shallow } from "enzyme";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeCameraCalibrationData,
} from "../../../../../__test_support__/fake_camera_data";
import {
  fakeDesignerState,
} from "../../../../../__test_support__/fake_designer_state";

describe("<ImageLayer/>", () => {
  const mockConfig = fakeWebAppConfig();
  mockConfig.body.photo_filter_begin = "";
  mockConfig.body.photo_filter_end = "";

  function fakeProps(): ImageLayerProps {
    const image = fakeImage();
    image.body.meta.z = 0;
    image.body.meta.name = "rotated_image";
    return {
      visible: true,
      images: [image],
      mapTransformProps: fakeMapTransformProps(),
      cameraCalibrationData: fakeCameraCalibrationData(),
      getConfigValue: key => mockConfig.body[key],
      designer: fakeDesignerState(),
    };
  }

  it("shows images", () => {
    const p = fakeProps();
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(1);
    expect(layer.props().clipPath).toEqual(undefined);
  });

  it("handles missing id", () => {
    const p = fakeProps();
    p.images[0].body.id = undefined;
    p.designer.hoveredMapImage = 1;
    p.designer.alwaysHighlightImage = true;
    p.designer.shownImages = [1];
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(1);
  });

  it("shows hovered image", () => {
    const p = fakeProps();
    p.images[0].body.id = 1;
    p.designer.alwaysHighlightImage = true;
    p.designer.shownImages = [1];
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(2);
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });

  it("filters old images: newer than", () => {
    const p = fakeProps();
    p.images[0].body.created_at = "2018-01-22T05:00:00.000Z";
    mockConfig.body.photo_filter_begin = "2018-01-23T05:00:00.000Z";
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });

  it("filters old images: older than", () => {
    const p = fakeProps();
    p.images[0].body.created_at = "2018-01-24T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "2018-01-23T05:00:00.000Z";
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });

  it("clips layer", () => {
    const p = fakeProps();
    mockConfig.body.clip_image_layer = true;
    const wrapper = shallow(<ImageLayer {...p} />);
    const layer = wrapper.find("#image-layer");
    expect(layer.props().clipPath).toEqual("url(#map-grid-clip-path)");
  });
});
