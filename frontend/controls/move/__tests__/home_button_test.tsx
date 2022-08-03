const mockDevice = {
  home: jest.fn((_) => Promise.resolve()),
  findHome: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount } from "enzyme";
import { calculateHomeDirection, HomeButton } from "../home_button";
import { HomeButtonProps } from "../interfaces";

describe("<HomeButton />", () => {
  const fakeProps = (): HomeButtonProps => ({
    doFindHome: false,
    arduinoBusy: false,
    botOnline: true,
    locked: false,
  });

  it("call has correct args", () => {
    const jogButtons = mount(<HomeButton {...fakeProps()} />);
    jogButtons.find("button").simulate("click");
    expect(mockDevice.home)
      .toHaveBeenCalledWith({ axis: "all", speed: 100 });
  });

  it("calls home command", () => {
    const jogButtons = mount(<HomeButton {...fakeProps()} />);
    jogButtons.find("button").simulate("click");
    expect(mockDevice.home).toHaveBeenCalledTimes(1);
  });

  it("calls find home command", () => {
    const p = fakeProps();
    p.doFindHome = true;
    const jogButtons = mount(<HomeButton {...p} />);
    jogButtons.find("button").simulate("click");
    expect(mockDevice.findHome).toHaveBeenCalledTimes(1);
  });
});

describe("calculateHomeDirection()", () => {
  it("returns correct direction", () => {
    expect(calculateHomeDirection(true, true)).toEqual(45);
    expect(calculateHomeDirection(true, false)).toEqual(-45);
    expect(calculateHomeDirection(false, true)).toEqual(135);
    expect(calculateHomeDirection(false, false)).toEqual(-135);
  });
});
