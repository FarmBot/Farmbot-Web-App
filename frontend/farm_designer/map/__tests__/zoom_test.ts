import * as ZoomUtils from "../zoom";
import * as configStorageActions from "../../../config_storage/actions";
import { NumericSetting } from "../../../session_keys";

describe("zoom utilities", () => {
  let setWebAppConfigValueSpy: jest.SpyInstance;

  beforeEach(() => {
    setWebAppConfigValueSpy =
      jest.spyOn(configStorageActions, "setWebAppConfigValue")
        .mockImplementation(jest.fn());
  });

  afterEach(() => {
    setWebAppConfigValueSpy.mockRestore();
  });

  it("getZoomLevelIndex()", () => {
    expect(ZoomUtils.getZoomLevelIndex(() => undefined)).toEqual(9);
  });

  it("saveZoomLevelIndex()", () => {
    ZoomUtils.saveZoomLevelIndex(jest.fn(), 9);
    expect(setWebAppConfigValueSpy)
      .toHaveBeenCalledWith(NumericSetting.zoom_level, 1);
  });

  it("calcZoomLevel()", () => {
    expect(ZoomUtils.calcZoomLevel(9)).toEqual(1);
  });

  it("within zoom range", () => {
    expect(ZoomUtils.atMaxZoom(() => 1)).toBeFalsy();
    expect(ZoomUtils.atMinZoom(() => 1)).toBeFalsy();
  });

  it("beyond max zoom", () => {
    const result = ZoomUtils.getZoomLevelIndex(() => 999);
    expect(result).toEqual(ZoomUtils.maxZoomIndex);
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

  it("zoomCompensation()", () => {
    expect(ZoomUtils.zoomCompensation(0.1)).toEqual(2);
    expect(ZoomUtils.zoomCompensation(1, 2)).toEqual(2);
    expect(ZoomUtils.zoomCompensation(1.8)).toEqual(0.7);
  });
});
