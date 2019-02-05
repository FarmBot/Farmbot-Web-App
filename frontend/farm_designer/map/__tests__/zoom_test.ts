jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn()
}));

import * as ZoomUtils from "../zoom";
import { setWebAppConfigValue } from "../../../config_storage/actions";

describe("zoom utilities", () => {
  it("getZoomLevelIndex()", () => {
    expect(ZoomUtils.getZoomLevelIndex(() => undefined)).toEqual(9);
  });

  it("saveZoomLevelIndex()", () => {
    ZoomUtils.saveZoomLevelIndex(jest.fn(), 9);
    expect(setWebAppConfigValue).toHaveBeenCalledWith("zoom_level", 1);
  });

  it("calcZoomLevel()", () => {
    expect(ZoomUtils.calcZoomLevel(9)).toEqual(1);
  });

  it("within zoom range", () => {
    expect(ZoomUtils.atMaxZoom(() => 1)).toBeFalsy();
    expect(ZoomUtils.atMinZoom(() => 1)).toBeFalsy();
  });

  it("at max zoom", () => {
    expect(ZoomUtils.atMaxZoom(() => ZoomUtils.maxZoomLevel)).toBeTruthy();
    expect(ZoomUtils.atMinZoom(() => ZoomUtils.maxZoomLevel)).toBeFalsy();
  });

  it("beyond max zoom", () => {
    const result = ZoomUtils.getZoomLevelIndex(() => 999);
    expect(result).toEqual(ZoomUtils.maxZoomIndex);
  });

  it("at min zoom", () => {
    expect(ZoomUtils.atMaxZoom(() => ZoomUtils.minZoomLevel)).toBeFalsy();
    expect(ZoomUtils.atMinZoom(() => ZoomUtils.minZoomLevel)).toBeTruthy();
  });

  it("beyond min zoom", () => {
    const result = ZoomUtils.getZoomLevelIndex(() => -999);
    expect(result).toEqual(0);
  });

  it("at unknown zoom", () => {
    const defaultZoom =
      ZoomUtils.calcZoomLevel(ZoomUtils.getZoomLevelIndex(() => undefined));
    expect(defaultZoom).toEqual(1);
  });
});
