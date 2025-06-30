interface Mock0Ref {
  current: number;
}
const mock0Ref: Mock0Ref = {
  current: 0,
};
interface Mock1Ref {
  current: { position: { set: Function; }; } | undefined;
}
const mock1Ref: Mock1Ref = {
  current: { position: { set: jest.fn() } }
};
interface Mock4Ref {
  current: { position: { set: Function; }; }[] | undefined;
}
const mock4Ref: Mock4Ref = {
  current: [
    { position: { set: jest.fn() } },
    { position: { set: jest.fn() } },
    { position: { set: jest.fn() } },
    { position: { set: jest.fn() } },
  ]
};
interface MockMaterialRef {
  current: { opacity: number; } | undefined;
}
const mockMaterialRef: MockMaterialRef = {
  current: { opacity: 0 }
};

import React from "react";
import { render } from "@testing-library/react";
import { calcSunI, getCycleLength, skyColor, Sun, SunProps } from "../sun";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { MeshBasicMaterial } from "three";

describe("<Sun />", () => {
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
      .mockImplementationOnce(() => mock4Ref)
      .mockImplementationOnce(() => mock4Ref)
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mock1Ref)
      .mockImplementationOnce(() => mock0Ref)
      .mockImplementationOnce(() => mockMaterialRef);
    jest.spyOn(React, "useState").mockReturnValue([[], jest.fn()]);
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
