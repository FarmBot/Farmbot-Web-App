let mockZoomValue: number | undefined = 1;
jest.mock("../../../session", () => {
  return {
    Session: {
      deprecatedGetNum: () => mockZoomValue,
      deprecatedSetNum: jest.fn()
    }
  };
});

import * as ZoomUtils from "../zoom";
import { Session } from "../../../session";

describe("zoom utilities", () => {
  it("getZoomLevelIndex()", () => {
    expect(ZoomUtils.getZoomLevelIndex()).toEqual(9);
  });

  it("saveZoomLevelIndex()", () => {
    ZoomUtils.saveZoomLevelIndex(9);
    expect(Session.deprecatedSetNum).toHaveBeenCalledWith("zoom_level", 1);
  });

  it("calcZoomLevel()", () => {
    expect(ZoomUtils.calcZoomLevel(9)).toEqual(1);
  });

  it("within zoom range", () => {
    mockZoomValue = 1;
    expect(ZoomUtils.atMaxZoom()).toBeFalsy();
    expect(ZoomUtils.atMinZoom()).toBeFalsy();
  });

  it("at max zoom", () => {
    mockZoomValue = ZoomUtils.maxZoomLevel;
    expect(ZoomUtils.atMaxZoom()).toBeTruthy();
    expect(ZoomUtils.atMinZoom()).toBeFalsy();
  });

  it("at min zoom", () => {
    mockZoomValue = ZoomUtils.minZoomLevel;
    expect(ZoomUtils.atMaxZoom()).toBeFalsy();
    expect(ZoomUtils.atMinZoom()).toBeTruthy();
  });

  it("at unknown zoom", () => {
    mockZoomValue = undefined;
    const defaultZoom = ZoomUtils.calcZoomLevel(ZoomUtils.getZoomLevelIndex());
    expect(defaultZoom).toEqual(1);
  });
});
