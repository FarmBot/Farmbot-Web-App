import React from "react";
import { CROP_SLUGS } from "../../crops/metadata";
import {
  STARGAZING_MAX_FOV, STARGAZING_MIN_FOV,
} from "./stargazing_constants";
import { STARGAZING_PROGRESS_STORAGE_KEY } from
  "./stargazing_progress_key";

export const STARGAZING_TOTAL_CONSTELLATIONS = CROP_SLUGS.length;
export const SPACEFLIGHT_UNLOCK_COUNT = 50;
const STARGAZING_PROGRESS_EVENT = "stargazing-progress-change";
const validCropSlugs = new Set(CROP_SLUGS);

const storage = () =>
  typeof localStorage == "undefined" ? undefined : localStorage;

export const readFoundConstellations = (): string[] => {
  try {
    const stored = JSON.parse(
      storage()?.getItem(STARGAZING_PROGRESS_STORAGE_KEY) || "[]",
    );
    if (!Array.isArray(stored)) { return []; }
    return [...new Set(stored.filter((slug): slug is string =>
      typeof slug == "string" && validCropSlugs.has(slug)))];
  } catch {
    return [];
  }
};

export const markConstellationFound = (cropSlug: string): boolean => {
  if (!validCropSlugs.has(cropSlug)) { return false; }
  const found = readFoundConstellations();
  if (found.includes(cropSlug)) { return false; }
  const next = [...found, cropSlug];
  try {
    storage()?.setItem(
      STARGAZING_PROGRESS_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    return false;
  }
  if (typeof window != "undefined") {
    window.dispatchEvent(new CustomEvent(STARGAZING_PROGRESS_EVENT));
  }
  return true;
};

export const useFoundConstellations = (): string[] => {
  const [found, setFound] = React.useState(readFoundConstellations);
  React.useEffect(() => {
    const update = () => setFound(readFoundConstellations());
    const updateFromStorage = (event: StorageEvent) => {
      if (event.key == STARGAZING_PROGRESS_STORAGE_KEY
        || event.key == undefined) {
        update();
      }
    };
    window.addEventListener(STARGAZING_PROGRESS_EVENT, update);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener(STARGAZING_PROGRESS_EVENT, update);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);
  return found;
};

export const getStargazingZoomUnlockedFraction = (
  foundCount: number,
): number => {
  if (foundCount >= 25) { return 1; }
  if (foundCount >= 15) { return 0.5; }
  if (foundCount >= 5) { return 0.25; }
  return 0;
};

export const getStargazingMaxFov = (foundCount: number): number =>
  STARGAZING_MIN_FOV
  + (STARGAZING_MAX_FOV - STARGAZING_MIN_FOV)
  * getStargazingZoomUnlockedFraction(foundCount);

export const isSpaceflightUnlocked = (foundCount: number): boolean =>
  foundCount >= SPACEFLIGHT_UNLOCK_COUNT;
