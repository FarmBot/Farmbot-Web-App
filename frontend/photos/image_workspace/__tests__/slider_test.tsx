import React from "react";
import {
  WeedDetectorSlider, SliderProps, onHslChange, OnHslChangeProps,
} from "../slider";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@blueprintjs/core", () => ({
  RangeSlider: (props: {
    onRelease?: (values: [number, number]) => void;
  }) =>
    <button onClick={() => props.onRelease?.([1, 5])}>
      release slider
    </button>,
}));

describe("<WeedDetectorSlider />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const fakeProps = (): SliderProps => ({
    onRelease: jest.fn(),
    highest: 99,
    lowest: 1,
    lowValue: 3,
    highValue: 5,
  });

  it("changes the slider", () => {
    const p = fakeProps();
    render(<WeedDetectorSlider {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /release slider/i }));
    expect(p.onRelease).toHaveBeenCalledWith([1, 5]);
  });
});

describe("onHslChange()", () => {
  const fakeProps = (): OnHslChangeProps => ({
    onChange: jest.fn(),
    iteration: 9,
    morph: 9,
    blur: 9,
    H_LO: 2,
    S_LO: 4,
    V_LO: 6,
    H_HI: 8,
    S_HI: 10,
    V_HI: 12,
  });

  it("triggers callback", () => {
    const p = fakeProps();
    onHslChange(p)("H")([1, 2]);
    expect(p.onChange).toHaveBeenCalledWith("H_LO", 1);
    expect(p.onChange).toHaveBeenCalledWith("H_HI", 2);
  });
});
