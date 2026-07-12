let mockDev: string | undefined = undefined;
let mockIsDesktop = true;

import {
  alignCameraPositionToViewPrism, applyCameraClippingRange,
  cameraInit, CameraInitProps, clearCameraUrlParams,
  cameraPositionForFov, canonicalCamera, distanceForFov,
  getCameraClippingRange, getCameraFromUrlParams, getDefaultCameraPosition,
  getCameraFit, GetDefaultCameraPositionProps, nearestCardinalHeading,
  nearestCardinalTopViewDirection, nearestViewPrismHeading,
  positionForViewDirection, setCameraUrlParams, viewPrismDirectionForHeading,
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
    viewpointHeading: 45,
    bedSize: { x: 3000, y: 1500 },
    zoomFactor: 10,
  });

  it("initializes camera", () => {
    mockDev = undefined;
    mockIsDesktop = true;
    const camera = cameraInit(fakeProps());
    expect(camera.target).toEqual([0, 0, 0]);
    expect(camera.position[0]).toBeCloseTo(2483.3613);
    expect(camera.position[1]).toBeCloseTo(-2483.3613);
    expect(camera.position[2]).toBeCloseTo(2483.3613);
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
    const camera = cameraInit(fakeProps());
    expect(camera.position[0]).toBeCloseTo(2483.3613);
    expect(camera.position[1]).toBeCloseTo(-2483.3613);
    expect(camera.position[2]).toBeCloseTo(2483.3613);
  });

  it("initializes camera: mobile", () => {
    mockDev = undefined;
    mockIsDesktop = false;
    const camera = cameraInit(fakeProps());
    expect(camera.target).toEqual([0, 0, 0]);
    expect(camera.position[0]).toBeCloseTo(4235.0298);
    expect(camera.position[1]).toBeCloseTo(-4235.0298);
    expect(camera.position[2]).toBeCloseTo(4235.0298);
  });

  it("initializes camera from heading", () => {
    mockDev = undefined;
    mockIsDesktop = true;
    const p = fakeProps();
    p.viewpointHeading = 90;
    const camera = cameraInit(p);
    expect(camera.target).toEqual([0, 0, 0]);
    expect(camera.position[0]).toBeCloseTo(3041.3813);
    expect(camera.position[1]).toEqual(0);
    expect(camera.position[2]).toBeCloseTo(3041.3813);
  });

  it("initializes a saved top-down camera above the garden", () => {
    mockDev = JSON.stringify({
      position: [1, 2, 3],
      target: [4, 5, 6],
    });
    const p = fakeProps();
    p.topDownAtStart = true;
    p.viewpointHeading = 90;
    expect(cameraInit(p)).toEqual({
      position: [1, 0, 5000],
      target: [0, 0, 0],
    });
  });
});

describe("nearestCardinalHeading()", () => {
  it("rounds normalized headings to the nearest cardinal", () => {
    expect(nearestCardinalHeading(30)).toEqual(0);
    expect(nearestCardinalHeading(45)).toEqual(90);
    expect(nearestCardinalHeading(315)).toEqual(0);
    expect(nearestCardinalHeading(-10)).toEqual(0);
  });
});

describe("getDefaultCameraPosition()", () => {
  const fakeProps = (): GetDefaultCameraPositionProps => ({
    heading: 0,
    bedSize: { x: 3000, y: 1500 },
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

  it("returns camera location visual location", () => {
    mockIsDesktop = true;
    const p = fakeProps();
    p.heading = 180;
    p.visual = true;
    expect(getDefaultCameraPosition(p)).toEqual([0, 2750, 2500]);
  });

  it("returns a top-down camera marker location", () => {
    const p = fakeProps();
    p.topDown = true;
    p.heading = 90;
    expect(getDefaultCameraPosition(p)).toEqual([3500, 0, 5000]);
  });
});

describe("perspective camera framing", () => {
  const clippingConfig = {
    sceneRadius: 41000,
    minNear: 10,
    minFar: 75000,
    maxCameraScale: 1,
  };

  it("preserves apparent scale while changing FOV", () => {
    const distance = distanceForFov(1000, 40, 1);
    expect(distance).toBeGreaterThan(40000);
    expect(cameraPositionForFov([1000, 0, 0], [0, 0, 0], 40, 1))
      .toEqual([distance, 0, 0]);
    expect(canonicalCamera({
      position: [distance, 0, 0],
      target: [0, 0, 0],
    }, 1).position[0]).toBeCloseTo(1000);
  });

  it("fits the circumscribed bed circle to the limiting viewport dimension", () => {
    const landscape = getCameraFit({
      viewport: { width: 1200, height: 600 },
      bedSize: { x: 3000, y: 4000 },
    });
    expect(landscape.circumscribedRadius).toEqual(2500);
    expect(landscape.cameraRadius * Math.tan(20 * Math.PI / 180))
      .toBeCloseTo(2500);

    const portrait = getCameraFit({
      viewport: { width: 300, height: 600 },
      bedSize: { x: 3000, y: 4000 },
    });
    expect(portrait.cameraRadius).toBeCloseTo(landscape.cameraRadius * 2);
    expect(getCameraFit({
      viewport: { width: 0, height: 0 },
      bedSize: { x: 0, y: 0 },
      fov: 20,
    }).cameraRadius).toEqual(0);
  });

  it.each([
    [[1, 0, 0], [100, 0, 0]],
    [[-1, 0, 0], [-100, 0, 0]],
    [[0, 1, 0], [0, 100, 0]],
    [[0, -1, 0], [0, -100, 0]],
    [[0, 0, 1], [0, 0, 100]],
    [[1, 1, 0], [Math.SQRT1_2 * 100, Math.SQRT1_2 * 100, 0]],
  ] as const)("maps the %s cube direction", (direction, expected) => {
    const position = positionForViewDirection(
      [...direction],
      [0, 0, 0],
      100,
    );
    position.map((value, index) =>
      expect(value).toBeCloseTo(expected[index]));
  });

  it.each([
    [0, [0, -1, 1]],
    [90, [1, 0, 1]],
    [180, [0, 1, 1]],
    [270, [-1, 0, 1]],
    [45, [1, -1, 1]],
    [135, [1, 1, 1]],
    [225, [-1, 1, 1]],
    [315, [-1, -1, 1]],
  ] as const)("maps heading %s to prism direction %s", (heading, expected) => {
    expect(viewPrismDirectionForHeading(heading)).toEqual(expected);
  });

  it("normalizes legacy headings to the nearest prism target", () => {
    expect(nearestViewPrismHeading(30)).toEqual(45);
    expect(nearestViewPrismHeading(-10)).toEqual(0);
    expect(nearestViewPrismHeading(370)).toEqual(0);
    const position = alignCameraPositionToViewPrism([3, 4, 0], 90);
    expect(Math.hypot(...position)).toBeCloseTo(5);
    expect(position[0]).toBeCloseTo(position[2]);
  });

  it("keeps the target for an empty cube direction", () => {
    expect(positionForViewDirection([0, 0, 0], [1, 2, 3], 100))
      .toEqual([1, 2, 3]);
  });

  it("tightens clipping around a distant camera", () => {
    expect(getCameraClippingRange(
      [100000, 0, 0],
      clippingConfig,
    )).toEqual({ near: 59000, far: 141000 });
    expect(getCameraClippingRange(
      [1000, 0, 0],
      clippingConfig,
    )).toEqual({ near: 10, far: 75000 });
    expect(getCameraClippingRange(
      [100000, 0, 0],
      { ...clippingConfig, maxCameraScale: 1.75 },
    ).far).toEqual(216000);
    expect(getCameraClippingRange(
      [0, 0, 0],
      { ...clippingConfig, sceneRadius: 0, minNear: 1000, minFar: 0 },
    )).toEqual({ near: 1000, far: 1001 });
  });

  it("applies clipping to the live perspective camera", () => {
    const camera = {
      position: { x: 100000, y: 0, z: 0 },
      near: 10,
      far: 75000,
      updateProjectionMatrix: jest.fn(),
    };
    applyCameraClippingRange(camera, clippingConfig);
    expect(camera.near).toEqual(59000);
    expect(camera.far).toEqual(141000);
    expect(camera.updateProjectionMatrix).toHaveBeenCalled();
    expect(() => applyCameraClippingRange(undefined, clippingConfig))
      .not.toThrow();
  });
});

describe("top view heading", () => {
  it.each([
    [[10, -20, 100], [0, -1, 5000]],
    [[20, -10, 100], [1, 0, 5000]],
    [[10, 20, 100], [0, 1, 5000]],
    [[-20, 10, 100], [-1, 0, 5000]],
  ] as const)("rounds %s to a cardinal heading", (position, expected) => {
    expect(nearestCardinalTopViewDirection(
      [...position],
      [0, 0, 0],
    )).toEqual(expected);
  });

  it("prefers the live OrbitControls azimuth", () => {
    expect(nearestCardinalTopViewDirection(
      [0, -1, 100],
      [0, 0, 0],
      Math.PI,
    )).toEqual([0, 1, 5000]);
  });

  it.each([
    [45, [0, -1, 5000]],
    [135, [0, 1, 5000]],
    [225, [0, 1, 5000]],
    [315, [0, -1, 5000]],
  ] as const)(
    "rounds landscape corner heading %s toward 0 or 180 degrees",
    (heading, expected) => {
      expect(nearestCardinalTopViewDirection(
        [0, 0, 0],
        [0, 0, 0],
        heading * Math.PI / 180,
        { width: 1200, height: 600 },
      )).toEqual(expected);
    },
  );

  it.each([
    [45, [1, 0, 5000]],
    [135, [1, 0, 5000]],
    [225, [-1, 0, 5000]],
    [315, [-1, 0, 5000]],
  ] as const)(
    "rounds portrait corner heading %s toward 90 or 270 degrees",
    (heading, expected) => {
      expect(nearestCardinalTopViewDirection(
        [0, 0, 0],
        [0, 0, 0],
        heading * Math.PI / 180,
        { width: 600, height: 1200 },
      )).toEqual(expected);
    },
  );

  it("uses the nearest heading away from an exact corner", () => {
    expect(nearestCardinalTopViewDirection(
      [0, 0, 0],
      [0, 0, 0],
      44 * Math.PI / 180,
      { width: 600, height: 1200 },
    )).toEqual([0, -1, 5000]);
    expect(nearestCardinalTopViewDirection(
      [0, 0, 0],
      [0, 0, 0],
      46 * Math.PI / 180,
      { width: 1200, height: 600 },
    )).toEqual([1, 0, 5000]);
  });

  it("retains normal tie rounding without a rectangular viewport", () => {
    expect(nearestCardinalTopViewDirection(
      [0, 0, 0],
      [0, 0, 0],
      Math.PI / 4,
    )).toEqual([1, 0, 5000]);
    expect(nearestCardinalTopViewDirection(
      [0, 0, 0],
      [0, 0, 0],
      Math.PI / 4,
      { width: 600, height: 600 },
    )).toEqual([1, 0, 5000]);
  });
});
