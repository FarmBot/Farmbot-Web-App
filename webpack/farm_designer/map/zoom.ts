import { Session } from "../../session";
import { NumericSetting } from "../../session_keys";
import { findIndex, isNumber } from "lodash";

/**
 * Map Zoom Level utilities
 *
 * `zoomLevels` defines an even zoom profile, while the `zoom_level` saved
 * in the API is a relative index value starting from a `zoom_level` of 1
 * resulting in a calculated zoom level of 1.0.
 */

const zoomLevels =
  [0.1, 0.15, 0.2, 0.25, 0.33, 0.41, 0.5, 0.6, 0.75, 1.0, 1.25, 1.5, 1.8];

const foundIndex = findIndex(zoomLevels, (x) => x === 1);
const zoomLevel1Index = foundIndex === -1 ? 9 : foundIndex;
const zoomLevelsCount = zoomLevels.length;
export const maxZoomLevel = zoomLevelsCount - zoomLevel1Index;
export const minZoomLevel = 1 - zoomLevel1Index;

export function atMaxZoom(): boolean {
  return getZoomLevelIndex() >= (zoomLevelsCount - 1);
}

export function atMinZoom(): boolean {
  return getZoomLevelIndex() <= 0;
}

/* Load the index of a saved zoom level. */
export function getZoomLevelIndex(): number {
  const savedValue = Session.deprecatedGetNum(NumericSetting.zoom_level);
  return isNumber(savedValue)
    ? savedValue + zoomLevel1Index - 1
    : zoomLevel1Index;
}

/* Save a zoom level index. */
export function saveZoomLevelIndex(index: number) {
  const payload = index - zoomLevel1Index + 1;
  Session.deprecatedSetNum(NumericSetting.zoom_level, payload);
}

/* Calculate map zoom level from a zoom level index. */
export function calcZoomLevel(index: number): number {
  return zoomLevels[index];
}
