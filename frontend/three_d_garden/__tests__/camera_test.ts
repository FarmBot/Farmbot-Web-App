let mockDev: string | undefined = undefined;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: { get3dCamera: () => mockDev }
}));

let mockIsDesktop = true;
jest.mock("../../screen_size", () => ({
  isDesktop: () => mockIsDesktop,
}));

import { cameraInit } from "../camera";

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
