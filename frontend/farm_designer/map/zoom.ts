import { NumericSetting } from "../../session_keys";
import { findIndex, isNumber, clamp, round } from "lodash";
import {
  setWebAppConfigValue, GetWebAppConfigValue,
} from "../../config_storage/actions";

/**
 * Map Zoom Level utilities
 *
 * `zoomLevels` defines an even zoom profile, while the `zoom_level` saved
 * in the API is a relative index value starting from a `zoom_level` of 1
 * resulting in a calculated zoom level of 1.0.
 */

const zoomLevels =
  [0.1, 0.15, 0.2, 0.25, 0.33, 0.41, 0.5, 0.6, 0.75, 1.0, 1.25, 1.5, 1.8];

const zoomLevel1Index = findIndex(zoomLevels, x => x === 1);
const zoomLevelsCount = zoomLevels.length;
export const maxZoomIndex = zoomLevelsCount - 1;
const clampZoom = (index: number): number => clamp(index, 0, maxZoomIndex);

export function atMaxZoom(getConfigValue: GetWebAppConfigValue): boolean {
  return getZoomLevelIndex(getConfigValue) >= maxZoomIndex;
}

export function atMinZoom(getConfigValue: GetWebAppConfigValue): boolean {
  return getZoomLevelIndex(getConfigValue) <= 0;
}

/** Load the index of a saved zoom level. */
export function getZoomLevelIndex(getConfigValue: GetWebAppConfigValue): number {
  const savedValue = getConfigValue(NumericSetting.zoom_level);
  if (!isNumber(savedValue)) { return zoomLevel1Index; }
  const zoomLevelIndex = savedValue + zoomLevel1Index - 1;
  return clampZoom(zoomLevelIndex);
}

/** Save a zoom level index. */
export function saveZoomLevelIndex(dispatch: Function, index: number) {
  const payload = index - zoomLevel1Index + 1;
  dispatch(setWebAppConfigValue(NumericSetting.zoom_level, payload));
}

/** Calculate map zoom level from a zoom level index. */
export function calcZoomLevel(index: number): number {
  return zoomLevels[clampZoom(index)];
}

/**
 * Calculate a size for important labels and annotations to make them
 * less affected by zoom (1/5x to 1.25x instead of 1/10x to ~2x apparent size).
 *
 *       zoom level: 0.1 0.15 0.2 0.25 0.33 0.41 0.5 0.6 0.75   1 1.25 1.5 1.8
 *   1/x zoom level:  10    7   5    4    3  2.4   3 1.7  1.3   1  0.8 0.7 0.6
 *
 * reduction factor:   2 1.94 1.9  1.8 1.74 1.66 1.6 1.4  1.3   1  0.9 0.8 0.7
 *  1/x compensated:   5  3.5 2.6  2.2 1.75 1.47 1.3 1.2    1   1  0.9 0.8 0.8
*/
export const zoomCompensation = (zoom: number, scale = 1) => {
  /** Desired zoom reduction factor for farthest out zoom level. */
  const RF_ZOOM_IN_MAX = 0.7;
  /** Desired zoom reduction factor for farthest in (closest) zoom level. */
  const RF_ZOOM_OUT_MIN = 2;
  const zoomLimit = zoom > 1 ? Math.max(...zoomLevels) : Math.min(...zoomLevels);
  const reductionFactor = zoom > 1 ? RF_ZOOM_IN_MAX : RF_ZOOM_OUT_MIN;
  const multiplier = (reductionFactor - 1) / (zoomLimit - 1);
  const base = 1 - multiplier;
  return round(scale * (base + multiplier * zoom), 2);
};
