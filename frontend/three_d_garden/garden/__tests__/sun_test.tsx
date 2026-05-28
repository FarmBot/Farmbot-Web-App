interface Mock1Ref {
  current: { position: { set: Function; }; } | undefined;
}
const mock1Ref: Mock1Ref = {
  current: { position: { set: jest.fn() } }
};
interface MockMaterialRef {
  current: { opacity: number; } | undefined;
}
const mockMaterialRef: MockMaterialRef = {
  current: { opacity: 0 }
};

import React from "react";
import { render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import {
  calcSunI, getAnimatedSeasonDate, getCycleLength, skyColor, Sun,
  sunPropsEqual, SunProps,
} from "../sun";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { MeshBasicMaterial, Vector3 } from "three";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { Points } from "../../components";

beforeEach(() => {
  jest.clearAllMocks();
});


describe("<Sun />", () => {
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
  });

  const fakeProps = (): SunProps => ({
    config: clone(INITIAL),
    skyRef: {
      current: { color: { setRGB: jest.fn() } } as unknown as MeshBasicMaterial,
    },
  });

  it("renders", () => {
    const { container } = render(<Sun {...fakeProps()} />);
    expect(container).toContainHTML("sun");
    expect(container).not.toContainHTML("line");
  });

  it("skips fully invisible static daylight stars", () => {
    const p = fakeProps();
    p.config.sunInclination = 45;
    p.config.animateSeasons = false;
    const wrapper = createRenderer(<Sun {...p} />);
    mountedWrappers.push(wrapper);
    expect(wrapper.root.findAllByType(Points)).toHaveLength(0);
  });

  it("renders stars outside full static daylight", () => {
    const p = fakeProps();
    p.config.sunInclination = -15;
    p.config.animateSeasons = false;
    const wrapper = createRenderer(<Sun {...p} />);
    mountedWrappers.push(wrapper);
    expect(wrapper.root.findAllByType(Points).length).toBeGreaterThan(0);
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
      startTimeRef: { current: 0 },
    })).toBeFalsy();
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

  it("renders animated", () => {
    jest.spyOn(React, "useRef")
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mockMaterialRef);
    jest.spyOn(React, "useState").mockReturnValue([new Vector3(), jest.fn()]);
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
    p.config.lightsDebug = true;
    const { container } = render(<Sun {...p} />);
    expect(container).toContainHTML("sun");
    expect(container).toContainHTML("line");
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
});

describe("skyColor(calcSunI())", () => {
  const DARK_BLUE = [
    0.04373502925049377,
    0.2788942634659966,
    0.4019777798219466,
  ];
  const BLUE = [
    0.09989872823822872,
    0.6866853124288864,
    1,
  ];

  it.each<[number, number[]]>([
    [100, BLUE],
    [0, DARK_BLUE],
    [-11, [0, 0, 0]],
    [191, [0, 0, 0]],
    [180, DARK_BLUE],
    [150, BLUE],
  ])("calculates sky color at %s degrees", (inclination, expected) => {
    skyColor(calcSunI(inclination) * 100).forEach((value, i) => {
      expect(value).toBeCloseTo(expected[i], 4);
    });
  });
});
