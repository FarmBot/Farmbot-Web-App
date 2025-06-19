interface MockRef {
  current: { position: { set: Function; }; }[] | undefined;
}
const mockRef: MockRef = {
  current: [
    { position: { set: jest.fn() } },
    { position: { set: jest.fn() } },
    { position: { set: jest.fn() } },
    { position: { set: jest.fn() } },
  ]
};

import React from "react";
import { render } from "@testing-library/react";
import { getCycleLength, Sun, SunProps } from "../sun";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Sun />", () => {
  const fakeProps = (): SunProps => ({
    config: clone(INITIAL),
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

  it("renders animated", () => {
    jest.spyOn(React, "useRef").mockReturnValue(mockRef);
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
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
});

describe("getCycleLength()", () => {
  it("returns cycle length", () => {
    expect(getCycleLength("Summer")).toEqual(20);
    expect(getCycleLength("Random")).toEqual(20);
  });
});
