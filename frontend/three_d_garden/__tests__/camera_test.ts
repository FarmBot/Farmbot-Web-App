let mockDev: string | undefined = undefined;
let mockIsDesktop = true;

import {
  cameraInit, CameraInitProps, getDefaultCameraPosition,
  GetDefaultCameraPositionProps,
} from "../camera";
import * as devSupport from "../../settings/dev/dev_support";
import * as screenSize from "../../screen_size";

let get3dCameraSpy: jest.SpyInstance;
let isDesktopSpy: jest.SpyInstance;

beforeEach(() => {
  get3dCameraSpy = jest.spyOn(devSupport.DevSettings, "get3dCamera")
    .mockImplementation((() =>
      mockDev || ""));
  isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
    .mockImplementation(() => mockIsDesktop);
});

afterEach(() => {
  get3dCameraSpy.mockRestore();
  isDesktopSpy.mockRestore();
});

describe("cameraInit()", () => {
  const fakeProps = (): CameraInitProps => ({
    topDown: false,
    viewpointHeading: 45,
    bedSize: { x: 3000, y: 1500 },
  });

  it("initializes camera", () => {
    mockDev = undefined;
    mockIsDesktop = true;
    expect(cameraInit(fakeProps())).toEqual({
      position: [2475, -2475, 2500],
      target: [0, 0, 0],
    });
  });

  it("initializes camera: dev", () => {
    mockDev = JSON.stringify({ position: [0, 0, 0], target: [0, 0, 0] });
    mockIsDesktop = true;
    expect(cameraInit(fakeProps())).toEqual({
      position: [0, 0, 0],
      target: [0, 0, 0],
    });
  });

  it("handles invalid dev camera setting", () => {
    mockDev = "{";
    mockIsDesktop = true;
    expect(cameraInit(fakeProps())).toEqual({
      position: [2475, -2475, 2500],
      target: [0, 0, 0],
    });
  });

  it("initializes camera: mobile", () => {
    mockDev = undefined;
    mockIsDesktop = false;
    expect(cameraInit(fakeProps())).toEqual({
      position: [4596, -4596, 3400],
      target: [0, 0, 0],
    });
  });

  it("initializes camera: top-down", () => {
    mockDev = undefined;
    mockIsDesktop = false;
    const p = fakeProps();
    p.topDown = true;
    expect(cameraInit(p)).toEqual({
      position: [0, 0, 5000],
      target: [0, 0, 0],
    });
  });

  it("initializes camera from heading", () => {
    mockDev = undefined;
    mockIsDesktop = true;
    const p = fakeProps();
    p.viewpointHeading = 90;
    expect(cameraInit(p)).toEqual({
      position: [3500, 0, 2500],
      target: [0, 0, 0],
    });
  });
});

describe("getDefaultCameraPosition()", () => {
  const fakeProps = (): GetDefaultCameraPositionProps => ({
    heading: 0,
    bedSize: { x: 3000, y: 1500 },
    topDown: false,
    visual: false,
  });

  it("returns desktop position", () => {
    mockIsDesktop = true;
    const p = fakeProps();
    p.heading = 180;
    expect(getDefaultCameraPosition(p)).toEqual([0, 3500, 2500]);
  });

  it("returns mobile position", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    p.heading = 270;
    expect(getDefaultCameraPosition(p)).toEqual([-6500, 0, 3400]);
  });

  it("returns top down position", () => {
    mockIsDesktop = true;
    const p = fakeProps();
    p.heading = 90;
    p.topDown = true;
    expect(getDefaultCameraPosition(p)).toEqual([3500, 0, 5000]);
  });

  it("returns camera location visual location", () => {
    mockIsDesktop = true;
    const p = fakeProps();
    p.heading = 180;
    p.visual = true;
    expect(getDefaultCameraPosition(p)).toEqual([0, 2750, 2500]);
  });
});
