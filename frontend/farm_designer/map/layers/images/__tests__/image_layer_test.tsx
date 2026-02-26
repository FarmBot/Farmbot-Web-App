import React from "react";
import { ImageLayer, ImageLayerProps } from "../image_layer";
import { render } from "@testing-library/react";
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
import { MapImage } from "../map_image";

describe("<ImageLayer/>", () => {
  let mockConfig = fakeWebAppConfig();

  beforeEach(() => {
    jest.spyOn(MapImage.prototype, "render")
      .mockImplementation(() => <g className={"map-image"} />);
    mockConfig = fakeWebAppConfig();
    mockConfig.body.photo_filter_begin = "";
    mockConfig.body.photo_filter_end = "";
    mockConfig.body.clip_image_layer = false;
  });

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
    const { container } = render(<svg><ImageLayer {...p} /></svg>);
    const layer = container.querySelector("#image-layer");
    if (!layer) { throw new Error("Missing image layer"); }
    expect(layer.querySelectorAll(".map-image").length).toEqual(1);
    expect((layer.getAttribute("clip-path") ?? undefined)).toBeUndefined();
  });

  it("handles missing id", () => {
    const p = fakeProps();
    p.images[0].body.id = undefined;
    p.designer.hoveredMapImage = 1;
    p.designer.alwaysHighlightImage = true;
    p.designer.shownImages = [1];
    const { container } = render(<svg><ImageLayer {...p} /></svg>);
    const layer = container.querySelector("#image-layer");
    if (!layer) { throw new Error("Missing image layer"); }
    expect(layer.querySelectorAll(".map-image").length).toEqual(1);
  });

  it("shows hovered image", () => {
    const p = fakeProps();
    p.images[0].body.id = 1;
    p.designer.alwaysHighlightImage = true;
    p.designer.shownImages = [1];
    const { container } = render(<svg><ImageLayer {...p} /></svg>);
    const layer = container.querySelector("#image-layer");
    if (!layer) { throw new Error("Missing image layer"); }
    expect(layer.querySelectorAll(".map-image").length).toEqual(1);
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const { container } = render(<svg><ImageLayer {...p} /></svg>);
    const layer = container.querySelector("#image-layer");
    if (!layer) { throw new Error("Missing image layer"); }
    expect(layer.querySelectorAll(".map-image").length).toEqual(0);
  });

  it("filters old images: newer than", () => {
    const p = fakeProps();
    p.images[0].body.created_at = "2018-01-22T05:00:00.000Z";
    mockConfig.body.photo_filter_begin = "2018-01-23T05:00:00.000Z";
    const { container } = render(<svg><ImageLayer {...p} /></svg>);
    const layer = container.querySelector("#image-layer");
    if (!layer) { throw new Error("Missing image layer"); }
    expect(layer.querySelectorAll(".map-image").length).toEqual(0);
  });

  it("filters old images: older than", () => {
    const p = fakeProps();
    p.images[0].body.created_at = "2018-01-24T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "2018-01-23T05:00:00.000Z";
    const { container } = render(<svg><ImageLayer {...p} /></svg>);
    const layer = container.querySelector("#image-layer");
    if (!layer) { throw new Error("Missing image layer"); }
    expect(layer.querySelectorAll(".map-image").length).toEqual(0);
  });

  it("clips layer", () => {
    const p = fakeProps();
    mockConfig.body.clip_image_layer = true;
    const { container } = render(<svg><ImageLayer {...p} /></svg>);
    const layer = container.querySelector("#image-layer");
    if (!layer) { throw new Error("Missing image layer"); }
    expect(layer.getAttribute("clip-path")).toEqual("url(#map-grid-clip-path)");
  });
});
