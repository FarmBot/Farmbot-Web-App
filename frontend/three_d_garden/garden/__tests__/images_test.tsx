let mockDemo = false;
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  extraRotation, getImagePosition, getImageTextureKey, getMirrorTextureProps,
  ImageTexture, ImageTextureProps,
} from "../images";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import {
  fakeImage, fakeSensorReading, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeAddPlantProps } from "../../../__test_support__/fake_props";
import * as mustBeOnline from "../../../devices/must_be_online";

beforeEach(() => {
  jest.spyOn(mustBeOnline, "forceOnline").mockImplementation(() => mockDemo);
});

afterEach(() => {
  mockDemo = false;
});

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

  it("changes texture key when moisture visibility changes", () => {
    const p = fakeProps();
    const key = getImageTextureKey(p);
    p.showMoistureMap = false;
    expect(getImageTextureKey(p)).not.toEqual(key);
  });

  it("changes texture key when moisture data changes", () => {
    const p = fakeProps();
    const reading = fakeSensorReading();
    p.sensorReadings = [reading];
    const key = getImageTextureKey(p);
    reading.body.value = 800;
    expect(getImageTextureKey(p)).not.toEqual(key);
  });
});

describe("extraRotation()", () => {
  it.each<[string, number]>([
    ["TOP_LEFT", 90],
    ["TOP_RIGHT", -180],
    ["BOTTOM_LEFT", 0],
    ["BOTTOM_RIGHT", -90],
  ])("returns extra rotation amount for %s", (value, result) => {
    const config = clone(INITIAL);
    config.imgOrigin = value;
    expect(extraRotation(config)).toEqual(result);
  });
});

describe("getMirrorTextureProps()", () => {
  it("returns mirrored repeat and offset", () => {
    const config = clone(INITIAL);
    config.mirrorX = true;
    config.mirrorY = true;
    expect(getMirrorTextureProps(config)).toEqual({
      repeat: [-1, -1],
      offset: [1, 1],
    });
  });
});

describe("getImagePosition()", () => {
  it("pre-mirrors image position while keeping offsets", () => {
    const config = clone(INITIAL);
    config.botSizeX = 1000;
    config.botSizeY = 500;
    config.imgOffsetX = 10;
    config.imgOffsetY = 20;
    config.mirrorX = true;
    config.mirrorY = true;
    expect(getImagePosition(config, 100, 200, 30, 40, 5))
      .toEqual([940, 360, 5]);
  });
});
