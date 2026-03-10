let mockDev: string | undefined = undefined;
let mockIsDesktop = true;

import { cameraInit } from "../camera";
import * as devSupport from "../../settings/dev/dev_support";
import * as screenSize from "../../screen_size";

let get3dCameraSpy: jest.SpyInstance;
let isDesktopSpy: jest.SpyInstance;

beforeEach(() => {
  get3dCameraSpy = jest.spyOn(devSupport.DevSettings, "get3dCamera")
    .mockImplementation(() => mockDev);
  isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
    .mockImplementation(() => mockIsDesktop);
});

afterEach(() => {
  get3dCameraSpy.mockRestore();
  isDesktopSpy.mockRestore();
});

describe("cameraInit()", () => {
  it("initializes camera", () => {
    mockDev = undefined;
    mockIsDesktop = true;
    expect(cameraInit(false)).toEqual({
      position: [2000, -4000, 2500],
      target: [0, 0, 0],
    });
  });

  it("initializes camera: dev", () => {
    mockDev = JSON.stringify({ position: [0, 0, 0], target: [0, 0, 0] });
    mockIsDesktop = true;
    expect(cameraInit(false)).toEqual({ position: [0, 0, 0], target: [0, 0, 0] });
  });

  it("handles invalid dev camera setting", () => {
    mockDev = "{";
    mockIsDesktop = true;
    expect(cameraInit(false)).toEqual({
      position: [2000, -4000, 2500],
      target: [0, 0, 0],
    });
  });

  it("initializes camera: mobile", () => {
    mockDev = undefined;
    mockIsDesktop = false;
    expect(cameraInit(false)).toEqual({
      position: [5400, -2500, 3400],
      target: [0, 0, 0],
    });
  });

  it("initializes camera: top-down", () => {
    mockDev = undefined;
    mockIsDesktop = false;
    expect(cameraInit(true)).toEqual({
      position: [0, 0, 5000],
      target: [0, 0, 0],
    });
  });
});
