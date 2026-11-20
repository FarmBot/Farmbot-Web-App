import { renderHook } from "@testing-library/react";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { clearBotShapeCache, useBotShapes } from "../bot_shapes";
import { getBotVersion } from "../bot_versions";

describe("useBotShapes()", () => {
  const createShapesMock = SVGLoader.createShapes as unknown as jest.Mock;

  beforeEach(() => {
    clearBotShapeCache();
    createShapesMock.mockClear();
  });

  it.each([
    ["v1.2", "track"],
    ["v1.3", "track"],
    ["v1.7", "track"],
    ["v1.8", "trackV18"],
    ["v1.9", "trackV18"],
  ])("selects the track profile for %s", (kitVersion, trackShape) => {
    expect(getBotVersion(kitVersion).trackShape).toEqual(trackShape);
  });

  it("keeps track profiles separate when switching versions", () => {
    const { result, rerender } = renderHook(
      ({ kitVersion }) => useBotShapes(true, getBotVersion(kitVersion)),
      { initialProps: { kitVersion: "v1.7" } },
    );
    const legacyTrack = result.current.track;
    const legacyBeam = result.current.beam;
    expect(legacyTrack).toBeDefined();
    expect(createShapesMock).toHaveBeenCalledTimes(16);

    rerender({ kitVersion: "v1.8" });
    const newerTrack = result.current.track;
    expect(newerTrack).toBeDefined();
    expect(newerTrack).not.toBe(legacyTrack);
    expect(result.current.beam).toBe(legacyBeam);
    // The shared SVG mock supplies five paths: four holes and an outline.
    expect(createShapesMock).toHaveBeenCalledTimes(21);

    rerender({ kitVersion: "v1.7" });
    expect(result.current.track).toBe(legacyTrack);
    expect(createShapesMock).toHaveBeenCalledTimes(21);

    rerender({ kitVersion: "v1.9" });
    expect(result.current.track).toBe(newerTrack);
    expect(result.current.beam).not.toBe(legacyBeam);
    expect(createShapesMock).toHaveBeenCalledTimes(26);
  });

  it("loads tracks only when enabled", () => {
    const { result, rerender } = renderHook(
      ({ tracks }) => useBotShapes(tracks, getBotVersion("v1.8")),
      { initialProps: { tracks: false } },
    );
    expect(result.current.track).toBeUndefined();
    expect(createShapesMock).toHaveBeenCalledTimes(11);
    rerender({ tracks: true });
    expect(result.current.track).toBeDefined();
    expect(createShapesMock).toHaveBeenCalledTimes(16);
  });

  it.each(["v1.7", "v1.8", "v1.9"])(
    "caches and clears the %s track profile", kitVersion => {
      const renderShapes = () => renderHook(() =>
        useBotShapes(true, getBotVersion(kitVersion)));
      const first = renderShapes();
      const track = first.result.current.track;
      first.unmount();
      createShapesMock.mockClear();

      const second = renderShapes();
      expect(second.result.current.track).toBe(track);
      expect(createShapesMock).not.toHaveBeenCalled();
      second.unmount();

      clearBotShapeCache();
      const third = renderShapes();
      expect(third.result.current.track).not.toBe(track);
      expect(createShapesMock).toHaveBeenCalled();
      third.unmount();
    },
  );
});
