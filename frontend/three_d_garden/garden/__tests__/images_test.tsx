let mockDemo = false;
jest.mock("../../../devices/must_be_online", () => ({
  forceOnline: () => mockDemo,
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { extraRotation, ImageTexture, ImageTextureProps } from "../images";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeAddPlantProps } from "../../../__test_support__/fake_props";

describe("<ImageTexture />", () => {
  const fakeProps = (): ImageTextureProps => ({
    config: clone(INITIAL),
    images: [],
    z: 0,
    xOffset: 0,
    yOffset: 0,
    sensors: [],
    sensorReadings: [],
    showMoistureReadings: true,
    showMoistureMap: true,
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.imgCenterX = 0;
    p.config.imgCenterY = 0;
    const img0 = fakeImage();
    img0.body.meta.x = 1;
    img0.body.meta.y = 1;
    img0.body.id = 1;
    const img1 = fakeImage();
    img1.body.meta.x = 1;
    img1.body.meta.y = 1;
    img1.body.id = 2;
    const img2 = fakeImage();
    img2.body.meta.x = 1;
    img2.body.meta.y = 1;
    img2.body.id = 3;
    p.images = [img0, img1, img2];
    const apProps = fakeAddPlantProps();
    apProps.designer.hoveredMapImage = 1;
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    apProps.getConfigValue = x => config.body[x];
    p.addPlantProps = apProps;
    render(<ImageTexture {...p} />);
    expect(screen.getAllByText("image").length).toEqual(3);
  });

  it("renders when images missing", () => {
    const p = fakeProps();
    p.images = [];
    render(<ImageTexture {...p} />);
    expect(screen.queryAllByText("image").length).toEqual(0);
  });

  it("doesn't render placeholder images", () => {
    const p = fakeProps();
    p.config.imgCenterX = 0;
    p.config.imgCenterY = 0;
    const img0 = fakeImage();
    img0.body.meta.x = 1;
    img0.body.meta.y = 1;
    img0.body.attachment_url = "placeholder";
    const img1 = fakeImage();
    img1.body.meta.x = 1;
    img1.body.meta.y = 1;
    img1.body.attachment_url = "mock_load_error";
    const img2 = fakeImage();
    img2.body.meta.x = 1;
    img2.body.meta.y = 1;
    p.images = [img0, img1, img2];
    const apProps = fakeAddPlantProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    apProps.getConfigValue = x => config.body[x];
    p.addPlantProps = apProps;
    render(<ImageTexture {...p} />);
    expect(screen.getAllByText("image").length).toEqual(1);
  });

  it("doesn't render images that don't match calibration", () => {
    const p = fakeProps();
    p.config.imgCenterX = 100;
    p.config.imgCenterY = 100;
    const img0 = fakeImage();
    img0.body.meta.x = 1;
    img0.body.meta.y = 1;
    p.images = [img0];
    const apProps = fakeAddPlantProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    apProps.getConfigValue = x => config.body[x];
    p.addPlantProps = apProps;
    render(<ImageTexture {...p} />);
    expect(screen.queryAllByText("image").length).toEqual(0);
  });

  it("doesn't rotate images that are already rotated", () => {
    const p = fakeProps();
    p.config.imgCenterX = 0;
    p.config.imgCenterY = 0;
    const img0 = fakeImage();
    img0.body.meta.x = 1;
    img0.body.meta.y = 1;
    img0.body.meta.name = "already_rotated";
    img0.body.id = 1;
    p.images = [img0];
    const apProps = fakeAddPlantProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    apProps.getConfigValue = x => config.body[x];
    p.addPlantProps = apProps;
    render(<ImageTexture {...p} />);
    expect(screen.queryAllByText("image").length).toEqual(1);
  });

  it("renders demo images", () => {
    mockDemo = true;
    const p = fakeProps();
    p.config.imgCenterX = 0;
    p.config.imgCenterY = 0;
    const img0 = fakeImage();
    img0.body.meta.x = 1;
    img0.body.meta.y = 1;
    img0.body.attachment_url = "foo/soil.png";
    p.images = [img0];
    const apProps = fakeAddPlantProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    apProps.getConfigValue = x => config.body[x];
    p.addPlantProps = apProps;
    render(<ImageTexture {...p} />);
    expect(screen.queryAllByText("image").length).toEqual(1);
  });
});

describe("extraRotation()", () => {
  it.each<[string, number]>([
    ["TOP_LEFT", 0],
    ["TOP_RIGHT", -90],
    ["BOTTOM_LEFT", 90],
    ["BOTTOM_RIGHT", 180],
  ])("returns extra rotation amount for %s", (value, result) => {
    const config = clone(INITIAL);
    config.imgOrigin = value;
    expect(extraRotation(config)).toEqual(result);
  });
});
