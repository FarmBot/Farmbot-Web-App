let mockDev: string | undefined = undefined;
let mockIsDesktop = true;

import {
  cameraInit, CameraInitProps, clearCameraUrlParams,
  getCameraFromUrlParams, getDefaultCameraPosition,
  GetDefaultCameraPositionProps, setCameraUrlParams,
} from "../camera";
import * as devSupport from "../../settings/dev/dev_support";
import * as screenSize from "../../screen_size";

let get3dCameraSpy: jest.SpyInstance;
let isDesktopSpy: jest.SpyInstance;
let replaceStateSpy: jest.SpyInstance;
let originalUrl: string;

beforeEach(() => {
  originalUrl = window.location.href;
  get3dCameraSpy = jest.spyOn(devSupport.DevSettings, "get3dCamera")
    .mockImplementation((() =>
      mockDev || ""));
  isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
    .mockImplementation(() => mockIsDesktop);
  replaceStateSpy = jest.spyOn(window.history, "replaceState")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  get3dCameraSpy.mockRestore();
  isDesktopSpy.mockRestore();
  replaceStateSpy.mockRestore();
  const url = new URL(originalUrl);
  window.location.href = url.toString();
  window.location.pathname = url.pathname;
  window.location.search = url.search;
  window.location.hash = url.hash;
});

describe("camera URL params", () => {
  const setUrl = (search = "") => {
    const url = new URL(`/app/designer${search}`, window.location.href);
    window.location.href = url.toString();
    window.location.pathname = url.pathname;
    window.location.search = url.search;
  };

  it("reads a camera from URL params", () => {
    setUrl("?camX=1&camY=2&camZ=3&camTX=4&camTY=5&camTZ=6");
    expect(getCameraFromUrlParams()).toEqual({
      position: [1, 2, 3],
      target: [4, 5, 6],
    });
  });

  it.each([
    "?camX=1",
    "?camX=1&camY=2&camZ=3&camTX=4&camTY=5&camTZ=invalid",
  ])("rejects an incomplete or invalid camera: %s", search => {
    setUrl(search);
    expect(getCameraFromUrlParams()).toBeUndefined();
  });

  it("sets and clears camera URL params", () => {
    setUrl("?keep=true&camX=100");
    setCameraUrlParams({
      position: [1.2, 2.5, 3.8],
      target: [4.4, 5.5, 6.6],
    });
    const setUrlCall = replaceStateSpy.mock.calls[0][2] as string;
    expect(setUrlCall.startsWith("/app/designer?")).toBeTruthy();
    expect(new URL(setUrlCall, window.location.href).search).toEqual(
      "?keep=true&urlCameraPos=true&camX=1&camY=3&camZ=4"
      + "&camTX=4&camTY=6&camTZ=7",
    );

    setUrl(new URL(setUrlCall, window.location.href).search);
    clearCameraUrlParams();
    const clearUrlCall = replaceStateSpy.mock.calls[1][2] as string;
    expect(new URL(clearUrlCall, window.location.href).search)
      .toEqual("?keep=true&urlCameraPos=true");
  });
});

describe("cameraInit()", () => {
  const fakeProps = (): CameraInitProps => ({
    topDown: false,
    viewpointHeading: 45,
    bedSize: { x: 3000, y: 1500 },
    zoomFactor: 10,
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
    zoomFactor: 10,
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
