import { act, renderHook } from "@testing-library/react";
import {
  getStargazingMaxFov, getStargazingZoomUnlockedFraction,
  isSpaceflightUnlocked, markConstellationFound,
  readFoundConstellations, SPACEFLIGHT_UNLOCK_COUNT,
  STARGAZING_TOTAL_CONSTELLATIONS, useFoundConstellations,
} from "../stargazing_progress";
import { STARGAZING_PROGRESS_STORAGE_KEY } from
  "../stargazing_progress_key";
import { CROP_SLUGS } from "../../../crops/metadata";

describe("stargazing progress", () => {
  it("reads unique valid crop slugs in discovery order", () => {
    localStorage.setItem(STARGAZING_PROGRESS_STORAGE_KEY, JSON.stringify([
      "apple", "missing-crop", "beet", "apple", 3,
    ]));

    expect(readFoundConstellations()).toEqual(["apple", "beet"]);
    expect(STARGAZING_TOTAL_CONSTELLATIONS).toEqual(CROP_SLUGS.length);
  });

  it("safely ignores malformed progress", () => {
    localStorage.setItem(STARGAZING_PROGRESS_STORAGE_KEY, "{");
    expect(readFoundConstellations()).toEqual([]);
    localStorage.setItem(STARGAZING_PROGRESS_STORAGE_KEY, "{}");
    expect(readFoundConstellations()).toEqual([]);
  });

  it("stores each valid discovery once", () => {
    expect(markConstellationFound("apple")).toEqual(true);
    expect(markConstellationFound("apple")).toEqual(false);
    expect(markConstellationFound("missing-crop")).toEqual(false);
    expect(markConstellationFound("beet")).toEqual(true);
    expect(readFoundConstellations()).toEqual(["apple", "beet"]);
  });

  it("doesn't announce progress that cannot be stored", () => {
    const setItem = jest.spyOn(localStorage, "setItem")
      .mockImplementation(() => { throw new Error("storage unavailable"); });
    expect(markConstellationFound("apple")).toEqual(false);
    setItem.mockRestore();
  });

  it("updates hooks in the current tab and from storage events", () => {
    const { result } = renderHook(() => useFoundConstellations());
    expect(result.current).toEqual([]);

    act(() => { markConstellationFound("apple"); });
    expect(result.current).toEqual(["apple"]);

    localStorage.setItem(
      STARGAZING_PROGRESS_STORAGE_KEY,
      JSON.stringify(["beet"]),
    );
    act(() => window.dispatchEvent(new StorageEvent("storage", {
      key: STARGAZING_PROGRESS_STORAGE_KEY,
    })));
    expect(result.current).toEqual(["beet"]);

    localStorage.clear();
    act(() => window.dispatchEvent(new StorageEvent("storage")));
    expect(result.current).toEqual([]);
  });

  it("calculates zoom and spaceflight unlock boundaries", () => {
    expect(getStargazingZoomUnlockedFraction(4)).toEqual(0);
    expect(getStargazingMaxFov(4)).toEqual(20);
    expect(getStargazingZoomUnlockedFraction(5)).toEqual(0.25);
    expect(getStargazingMaxFov(5)).toEqual(37.5);
    expect(getStargazingZoomUnlockedFraction(15)).toEqual(0.5);
    expect(getStargazingMaxFov(15)).toEqual(55);
    expect(getStargazingZoomUnlockedFraction(25)).toEqual(1);
    expect(getStargazingMaxFov(25)).toEqual(90);
    expect(isSpaceflightUnlocked(SPACEFLIGHT_UNLOCK_COUNT - 1))
      .toEqual(false);
    expect(isSpaceflightUnlocked(SPACEFLIGHT_UNLOCK_COUNT)).toEqual(true);
  });
});
