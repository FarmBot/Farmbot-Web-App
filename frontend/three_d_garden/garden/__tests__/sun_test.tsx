const originalFetch = global.fetch;
const originalWindowFetch = window.fetch;

import React from "react";
import { render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import {
  AnimatedSunFrame, calcSunI, getAnimatedSeasonDate, getCycleLength,
  getAnimatedSeasonSunCoordinate, getSeasonAnimationElapsed,
  getSeasonAnimationElapsedAtSunPosition, skyColor, Sun, sunPropsEqual,
  SunProps,
} from "../sun";
import {
  generateStars, projectConstellationPoint, starShaderModification,
} from "../constellations";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import {
  MeshBasicMaterial, WebGLProgramParametersWithUniforms,
} from "three";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { SECTION_CLIPPING_EXEMPT } from "../../section";
import { CropConstellationCatalog } from "../constellation_data";

beforeEach(() => {
  jest.clearAllMocks();
  const pendingConstellationData = new Promise<ArrayBuffer>(() => undefined);
  const fetchMock = jest.fn(() => Promise.resolve({
    ok: true,
    arrayBuffer: () => pendingConstellationData,
  })) as unknown as typeof fetch;
  global.fetch = fetchMock;
  window.fetch = fetchMock;
});

afterAll(() => {
  global.fetch = originalFetch;
  window.fetch = originalWindowFetch;
});

describe("getSeasonAnimationElapsed", () => {
  it("gets elapsed time from fixed and active season animations", () => {
    expect(getSeasonAnimationElapsed(false, { current: -12 })).toEqual(12);

    const now = jest.spyOn(performance, "now").mockReturnValue(15_000);
    expect(getSeasonAnimationElapsed(true, { current: 10 })).toEqual(5);
    now.mockRestore();
  });
});


describe("<Sun />", () => {
  const fakeProps = (): SunProps => ({
    config: clone(INITIAL),
    stargazing: false,
    skyRef: {
      current: { color: { setRGB: jest.fn() } } as unknown as MeshBasicMaterial,
    },
  });

  it("renders", () => {
    const { container } = render(<Sun {...fakeProps()} />);
    expect(container).toContainHTML("sun");
    expect(container).not.toContainHTML("line");
  });

  it("is exempt from section clipping", () => {
    const p = fakeProps();
    p.config.sunInclination = 45;
    p.config.animateSeasons = false;
    const wrapper = createRenderer(<Sun {...p} />);
    const sun = wrapper.root.findByProps({ name: "sun" });
    expect(sun.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(true);
    unmountRenderer(wrapper);
  });

  it("clips camera-side stars and applies individual sizes", () => {
    const shader = {
      uniforms: {},
      vertexShader: [
        "#include <common>",
        "#include <project_vertex>",
        "gl_PointSize = size;",
      ].join("\n"),
    } as WebGLProgramParametersWithUniforms;

    starShaderModification(shader);

    expect(shader.vertexShader).toContain("starCameraAlignment");
    expect(shader.vertexShader).toContain("> 0.866025");
    expect(shader.vertexShader).toContain(
      "gl_Position = vec4(2.0, 2.0, 2.0, 1.0)",
    );
    expect(shader.vertexShader).toContain("attribute float starSize;");
    expect(shader.vertexShader).toContain(
      "gl_PointSize = size * starSize;",
    );
  });

  it("generates background and projected constellation stars", () => {
    const catalog: CropConstellationCatalog = {
      coordinateScale: 0.01,
      totalPointCount: 3,
      constellations: [{
        cropSlug: "test-crop",
        pointCount: 3,
        points: new Int8Array([0, 0, 10, 0, 0, 10]),
      }],
    };
    const placement = { heading: 30, phi: 40, angularSize: 12 };
    const stars = generateStars(catalog, [placement], () => 0);
    expect(stars.positions).toHaveLength(stars.sizes.length * 3);
    expect(stars.sizes.slice(-3)).toEqual(
      new Float32Array([1.5, 1.5, 1.5]),
    );
    const firstConstellationIndex = stars.positions.length - 9;
    const expected = projectConstellationPoint(
      [0, 0],
      placement.heading,
      placement.phi,
      undefined,
      placement.angularSize,
    );
    expected.forEach((value, axis) =>
      expect(stars.positions[firstConstellationIndex + axis])
        .toBeCloseTo(value, 2));
  });

  it("skips season animation frame setup by default", () => {
    render(<Sun {...fakeProps()} />);
    expect(threeFiber.useFrame as jest.Mock).not.toHaveBeenCalled();
  });

  it("registers season animation frame setup when seasons animate", () => {
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
    render(<Sun {...p} />);
    expect(threeFiber.useFrame as jest.Mock).toHaveBeenCalledTimes(1);
  });

  it("memoizes unchanged sun props", () => {
    render(<Sun {...fakeProps()} />);
    const memoized = Sun as unknown as { $$typeof: symbol };
    expect(memoized.$$typeof.toString()).toContain("react.memo");
  });

  it("compares sun-relevant config fields", () => {
    const p = fakeProps();
    expect(sunPropsEqual(p, {
      ...p,
      config: { ...p.config, botSizeZ: p.config.botSizeZ + 1 },
    })).toBeTruthy();
    expect(sunPropsEqual(p, {
      ...p,
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeFalsy();
    expect(sunPropsEqual(p, {
      ...p,
      config: { ...p.config, constellations: false },
    })).toBeFalsy();
    expect(sunPropsEqual(p, {
      ...p,
      config: { ...p.config, constellationsDebug: true },
    })).toBeFalsy();
    expect(sunPropsEqual(p, {
      ...p,
      startTimeRef: { current: 0 },
    })).toBeFalsy();
    expect(sunPropsEqual(p, {
      ...p,
      onSunBelowHorizonChange: jest.fn(),
    })).toBeFalsy();
    expect(sunPropsEqual(p, {
      ...p,
      stargazing: true,
    })).toBeFalsy();
  });

  it("reports when the sun reaches the horizon", () => {
    const p = fakeProps();
    p.config.animateSeasons = false;
    p.config.sunInclination = 0;
    p.onSunBelowHorizonChange = jest.fn();
    render(<Sun {...p} />);
    expect(p.onSunBelowHorizonChange).toHaveBeenCalledWith(true);
  });

  it("doesn't render animated", () => {
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = undefined;
    const { container } = render(<Sun {...p} />);
    expect(container).toContainHTML("sun");
    expect(container).not.toContainHTML("line");
  });

  it("renders debug helpers", () => {
    const p = fakeProps();
    p.config.lightsDebug = true;
    const { container } = render(<Sun {...p} />);
    expect(container).toContainHTML("sun");
    expect(container).toContainHTML("line");
  });

  it("expands shadow bounds around the bed", () => {
    const p = fakeProps();
    const { container } = render(<Sun {...p} />);
    const light = container.querySelector("directionallight");
    expect(light).not.toBeNull();
    const right = Number(light?.getAttribute("shadow-camera-right"));
    const left = Number(light?.getAttribute("shadow-camera-left"));
    const bedBuffer = 1000;
    const bedXBounds = Math.max(
      Math.abs(p.config.bedXOffset),
      Math.abs(p.config.bedLengthOuter - p.config.bedXOffset),
    );
    const bedYBounds = Math.max(
      Math.abs(p.config.bedYOffset),
      Math.abs(p.config.bedWidthOuter - p.config.bedYOffset),
    );
    const bedBounds = Math.max(bedXBounds, bedYBounds) + bedBuffer;
    const minBound = Math.max(
      bedBounds,
      p.config.botSizeX,
      p.config.botSizeY,
    );
    expect(right).toBeGreaterThanOrEqual(minBound);
    expect(left).toBeLessThanOrEqual(-minBound);
  });

  it("disables shadows in low-detail mode", () => {
    const p = fakeProps();
    p.config.lowDetail = true;
    const { container } = render(<Sun {...p} />);
    const light = container.querySelector("directionallight");
    expect(light?.getAttribute("castshadow")).not.toEqual("true");
  });

  it("renders animated without ref", () => {
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
    // eslint-disable-next-line no-null/no-null
    p.skyRef = { current: null };
    const { container } = render(<Sun {...p} />);
    expect(container).toContainHTML("sun");
    expect(container).not.toContainHTML("line");
  });

  it("updates every animated sun object", () => {
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
    const lightPosition = { set: jest.fn() };
    const debugPosition = { set: jest.fn() };
    const sunPosition = { set: jest.fn() };
    const flatPosition = { set: jest.fn() };
    const light = { position: lightPosition, intensity: 0 };
    const setPoint = jest.fn();
    const setSunSky = jest.fn();
    render(<AnimatedSunFrame
      {...p}
      lightRef={{ current: light } as never}
      debugSunRef={{ current: { position: debugPosition } } as never}
      sunRef={{ current: { position: sunPosition } } as never}
      sunFlatRef={{ current: { position: flatPosition } } as never}
      lineRef={{ current: {} } as never}
      animatedSunRef={{
        current: { color: "", intensity: 0, inclination: 0, azimuth: 0 },
      }}
      sunIntensity={100}
      setPoint={setPoint}
      setSunSky={setSunSky} />);

    expect(lightPosition.set).toHaveBeenCalled();
    expect(Number.isFinite(light.intensity)).toEqual(true);
    expect(debugPosition.set).toHaveBeenCalled();
    expect(sunPosition.set).toHaveBeenCalled();
    expect(flatPosition.set).toHaveBeenCalled();
    expect(setPoint).toHaveBeenCalled();
    expect(setSunSky).toHaveBeenCalled();
  });
});

describe("getCycleLength()", () => {
  it("returns cycle length", () => {
    expect(getCycleLength("Summer")).toEqual(20);
    expect(getCycleLength("Random")).toEqual(20);
  });
});

describe("getAnimatedSeasonDate()", () => {
  it("uses fixed dates for recognized seasons", () => {
    const date = getAnimatedSeasonDate("Summer", 0);
    expect(date.getUTCMonth()).toEqual(5);
    expect(date.getUTCDate()).toEqual(21);
  });

  it("uses the provided day start for unknown seasons", () => {
    const dayStart = new Date(Date.UTC(2026, 0, 2));
    const date = getAnimatedSeasonDate("Custom", 0, dayStart);
    expect(date.getUTCFullYear()).toEqual(2026);
    expect(date.getUTCMonth()).toEqual(0);
    expect(date.getUTCDate()).toEqual(2);
  });

  it("calculates the season's midnight sun coordinate", () => {
    const midnight = getAnimatedSeasonSunCoordinate("Summer", 0);
    expect(midnight.inclination).toBeLessThan(0);
    expect(midnight.azimuth).toBeGreaterThanOrEqual(0);
    expect(midnight.azimuth).toBeLessThan(360);
  });

  it("finds the animation state matching a sun coordinate", () => {
    const coordinate = getAnimatedSeasonSunCoordinate("Summer", 8);
    const elapsed = getSeasonAnimationElapsedAtSunPosition(
      "Summer",
      coordinate.inclination,
      coordinate.azimuth,
    );
    expect(elapsed).toBeCloseTo(8, 1);
  });
});

describe("calcSunI()", () => {
  it("transitions at the day and night thresholds", () => {
    expect(calcSunI(-11)).toEqual(0);
    expect(calcSunI(-10)).toEqual(0);
    expect(calcSunI(0)).toEqual(0.5);
    expect(calcSunI(10)).toEqual(1);
    expect(calcSunI(170)).toEqual(1);
    expect(calcSunI(180)).toEqual(0.5);
    expect(calcSunI(190)).toEqual(0);
    expect(calcSunI(191)).toEqual(0);
  });

  // These endpoints are cached because they are used every render frame.
  it("returns cached endpoints and interpolated sky values", () => {
    expect(skyColor(0)).toBe(skyColor(-1));
    expect(skyColor(INITIAL.sun)).toBe(skyColor(INITIAL.sun + 1));
    expect(skyColor(INITIAL.sun / 2)).toHaveLength(3);
  });
});
