let mockDev: string | undefined = undefined;
let mockIsDesktop = true;

import {
  cameraInit, CameraInitProps, getDefaultCameraPosition,
} from "../camera";
import * as devSupport from "../../settings/dev/dev_support";
import * as screenSize from "../../screen_size";

let get3dCameraSpy: jest.SpyInstance;
let isDesktopSpy: jest.SpyInstance;

beforeEach(() => {
  get3dCameraSpy = jest.spyOn(devSupport.DevSettings, "get3dCamera")
    .mockImplementation((() =>
      mockDev || "") as typeof devSupport.DevSettings.get3dCamera);
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
    viewpointHeading: 0,
  });

  it("initializes camera", () => {
    mockDev = undefined;
    mockIsDesktop = true;
    expect(cameraInit(fakeProps())).toEqual({
      position: [2000, -4000, 2500],
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
      position: [2000, -4000, 2500],
      target: [0, 0, 0],
    });
  });

  it("initializes camera: mobile", () => {
    mockDev = undefined;
    mockIsDesktop = false;
    expect(cameraInit(fakeProps())).toEqual({
      position: [5400, -2500, 3400],
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
      position: [2000, 4000, 2500],
      target: [0, 0, 0],
    });
  });
});

describe("getDefaultCameraPosition()", () => {
  it("returns desktop position", () => {
    mockIsDesktop = true;
    expect(getDefaultCameraPosition(180)).toEqual([-2000, 4000, 2500]);
  });

  it("returns mobile position", () => {
    mockIsDesktop = false;
    expect(getDefaultCameraPosition(270)).toEqual([-5400, -2500, 3400]);
  });

  it("returns top down position", () => {
    mockIsDesktop = true;
    expect(getDefaultCameraPosition(90, true)).toEqual([5657, 0, 5000]);
  });
});
