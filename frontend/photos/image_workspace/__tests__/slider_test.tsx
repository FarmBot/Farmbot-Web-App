import React from "react";
import {
  WeedDetectorSlider, SliderProps, onHslChange, OnHslChangeProps,
} from "../slider";
import { shallow } from "enzyme";
import { RangeSlider } from "@blueprintjs/core";

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
    const wrapper = shallow(<WeedDetectorSlider {...p} />);
    wrapper.find(RangeSlider).props().onRelease?.([1, 5]);
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
