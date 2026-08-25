let mockDemo = false;
import React from "react";
import { useTexture } from "@react-three/drei";
import { render, screen } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
import {
  createCircleCropMask,
  extraRotation, getImagePosition, getImageTextureKey, getMirrorTextureProps,
  get3DImageCrop, getCroppedTexture, getImageClippingPlanes,
  ImageTexture, ImageTextureProps, splitFilteredImages,
} from "../images";
import { INITIAL, SurfaceDebugOption } from "../../config";
import { clone } from "lodash";
import {
  fakeImage, fakeSensor, fakeSensorReading, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeAddPlantProps } from "../../../__test_support__/fake_props";
import * as mustBeOnline from "../../../devices/must_be_online";
import { Texture, Vector3 } from "three";

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
    env: {},
  });

  it("crops camera images when enabled", () => {
    expect(get3DImageCrop({
      enabled: true,
      imageRotation: 20,
      imageWidth: 400,
      imageHeight: 200,
      imageScale: 0.5,
    })).toEqual({
      circle: false,
      width: 153.5,
      height: 53.5,
      repeat: [0.7675, 0.535],
      offset: [0.11625, 0.2325],
    });
    expect(get3DImageCrop({
      enabled: false,
      imageRotation: 20,
      imageWidth: 400,
      imageHeight: 200,
      imageScale: 0.5,
    })).toBeUndefined();
    expect(get3DImageCrop({
      enabled: true,
      imageRotation: 45,
      imageWidth: 400,
      imageHeight: 200,
      imageScale: 0.5,
    })).toEqual(expect.objectContaining({
      circle: true,
      width: 100,
      height: 100,
    }));
  });

  it("applies crop and clipping textures", () => {
    const source = new Texture();
    const cropped = getCroppedTexture(source, {
      circle: false,
      width: 100,
      height: 50,
      repeat: [0.5, 0.25],
      offset: [0.25, 0.375],
    });
    expect(cropped).not.toBe(source);
    expect(cropped.repeat.toArray()).toEqual([0.5, 0.25]);
    expect(cropped.offset.toArray()).toEqual([0.25, 0.375]);
    expect(cropped.version).toBeGreaterThan(0);

    const config = { botSizeX: 1000, botSizeY: 500, clipImages: true };
    const planes = getImageClippingPlanes(config) || [];
    expect(planes).toHaveLength(4);
    expect(planes.every(plane =>
      plane.distanceToPoint(new Vector3(500, 250, 0)) >= 0)).toBeTruthy();
    expect(planes.some(plane =>
      plane.distanceToPoint(new Vector3(1001, 250, 0)) < 0)).toBeTruthy();
    expect(getImageClippingPlanes({ ...config, clipImages: false }))
      .toBeUndefined();

    const mask = createCircleCropMask();
    const maskData = mask.image.data as Uint8Array;
    expect(maskData[0]).toEqual(0);
    const center = (32 * 64 + 32) * 4;
    expect(maskData[center]).toEqual(255);
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
    expect(screen.getAllByText("image-border").length).toEqual(1);
    expect(document.querySelector(".render-texture"))
      .toHaveAttribute("data-frames", "1");
  });

  it("renders when images missing", () => {
    const p = fakeProps();
    p.images = [];
    render(<ImageTexture {...p} />);
    expect(screen.queryAllByText("image").length).toEqual(0);
  });

  it("counts soil texture renders", () => {
    let view: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      view = TestRenderer.create(<ImageTexture {...fakeProps()} />);
    });
    const soilPlane = view?.root.findAllByProps({ className: "plane" })[0];
    expect(soilPlane).toBeDefined();
    soilPlane?.props.onBeforeRender();
    TestRenderer.act(() => view?.unmount());
  });

  it("doesn't render images without coordinates", () => {
    const p = fakeProps();
    p.config.imgCenterX = 0;
    p.config.imgCenterY = 0;
    const img0 = fakeImage();
    img0.body.meta.x = undefined;
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

  it("changes texture key when photo submenu filters change", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const key = getImageTextureKey(p);
    p.addPlantProps.designer = {
      ...p.addPlantProps.designer,
      showDetectionImages: false,
    };
    expect(getImageTextureKey(p)).not.toEqual(key);
  });

  it("changes texture key when image processing finishes", () => {
    const p = fakeProps();
    const image = fakeImage();
    image.body.attachment_url = "/placeholder_farmbot.jpg?text=Processing";
    p.images = [image];
    const key = getImageTextureKey(p);

    image.body.attachment_url = "https://example.com/processed.jpg";

    expect(getImageTextureKey(p)).not.toEqual(key);
  });

  it("changes texture key from blank to normal surface rendering", () => {
    const p = fakeProps();
    p.config.surfaceDebug = SurfaceDebugOption.blank;
    const key = getImageTextureKey(p);
    p.config.surfaceDebug = SurfaceDebugOption.none;

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

  it("changes texture key when moisture sensor metadata changes", () => {
    const p = fakeProps();
    const sensor = fakeSensor();
    p.sensors = [sensor];
    const key = getImageTextureKey(p);
    sensor.body.pin = (sensor.body.pin || 0) + 1;
    expect(getImageTextureKey(p)).not.toEqual(key);
  });

  it("memoizes texture setup across unrelated config churn", () => {
    const p = fakeProps();
    p.config.imgCenterX = 0;
    p.config.imgCenterY = 0;
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
    const useTextureMock = useTexture as unknown as jest.Mock;
    useTextureMock.mockClear();

    const { rerender } = render(<ImageTexture {...p} />);
    const initialCalls = useTextureMock.mock.calls.length;
    rerender(<ImageTexture {...p} config={{
      ...p.config,
      heading: p.config.heading + 10,
      label: "unrelated config churn",
    }} />);
    expect(useTextureMock).toHaveBeenCalledTimes(initialCalls);
    rerender(<ImageTexture {...p} config={{
      ...p.config,
      mirrorX: !p.config.mirrorX,
    }} />);

    expect(useTextureMock.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it("reuses image wrappers across soil brightness churn", () => {
    const p = fakeProps();
    p.config.imgCenterX = 0;
    p.config.imgCenterY = 0;
    const img0 = fakeImage();
    img0.body.meta.x = 1;
    img0.body.meta.y = 1;
    img0.body.attachment_url = "https://example.com/image-0.jpg";
    const img1 = fakeImage();
    img1.body.meta.x = 2;
    img1.body.meta.y = 2;
    img1.body.attachment_url = "https://example.com/image-1.jpg";
    p.images = [img0, img1];
    const apProps = fakeAddPlantProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    apProps.getConfigValue = x => config.body[x];
    p.addPlantProps = apProps;
    const useTextureMock = useTexture as unknown as jest.Mock;
    useTextureMock.mockClear();

    const { rerender } = render(<ImageTexture {...p} />);
    useTextureMock.mockClear();
    rerender(<ImageTexture {...p} config={{
      ...p.config,
      soilBrightness: p.config.soilBrightness + 1,
    }} />);
    const callsAfterSoilChurn = useTextureMock.mock.calls.length;
    rerender(<ImageTexture {...p} config={{
      ...p.config,
      imgScale: p.config.imgScale + 0.1,
    }} />);

    expect(callsAfterSoilChurn).toEqual(1);
    expect(useTextureMock.mock.calls.length).toBeGreaterThan(callsAfterSoilChurn);
  });
});

describe("splitFilteredImages()", () => {
  it("separates highlighted images in existing order", () => {
    const img0 = fakeImage();
    const img1 = fakeImage();
    const img2 = fakeImage();
    const images = [
      { ...img0, highlighted: false },
      { ...img1, highlighted: true },
      { ...img2, highlighted: false },
    ];

    const result = splitFilteredImages(images);

    expect(result.imageArray).toEqual([images[0], images[2]]);
    expect(result.lastImageArray).toEqual([images[1]]);
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
