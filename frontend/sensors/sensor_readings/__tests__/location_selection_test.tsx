import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { LocationSelection, LocationDisplay } from "../location_selection";
import { LocationSelectionProps } from "../interfaces";
import { changeBlurableInputRTL } from "../../../__test_support__/helpers";

describe("<LocationSelection />", () => {
  function fakeProps(): LocationSelectionProps {
    return {
      xyzLocation: undefined,
      deviation: 0,
      setLocation: jest.fn(),
      setDeviation: jest.fn(),
    };
  }

  it("renders", () => {
    const { container } = render(<LocationSelection {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["x", "y", "z", "deviation"]
      .map(string => expect(txt).toContain(string));
  });

  it("changes location", () => {
    const p = fakeProps();
    p.xyzLocation = { x: 10, y: 20, z: 30 };
    const { container } = render(<LocationSelection {...p} />);
    fireEvent.blur(container.querySelectorAll("input")[0] as Element);
    expect(p.setLocation).toHaveBeenCalledWith({ x: 10, y: 20, z: 30 });
  });

  it("changes location: undefined", () => {
    const p = fakeProps();
    p.xyzLocation = undefined;
    const { container } = render(<LocationSelection {...p} />);
    fireEvent.blur(container.querySelectorAll("input")[0] as Element);
    expect(p.setLocation).toHaveBeenCalledWith({ x: undefined });
  });

  it("changes deviation", () => {
    const p = fakeProps();
    const { container } = render(<LocationSelection {...p} />);
    const input = container.querySelectorAll("input")[3] as HTMLElement;
    changeBlurableInputRTL(input, "100");
    expect(p.setDeviation).toHaveBeenCalledWith(100);
  });
});

describe("<LocationDisplay />", () => {
  it("renders location ranges", () => {
    const p = { xyzLocation: { x: 10, y: 20, z: 30 }, deviation: 2 };
    const { container } = render(<LocationDisplay {...p} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["x", "y", "z", "8–12", "18–22", "28–32"]
      .map(string => expect(txt).toContain(string));
  });
});
