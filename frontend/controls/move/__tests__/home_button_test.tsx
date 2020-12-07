const mockDevice = {
  home: jest.fn((_) => Promise.resolve()),
  findHome: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount } from "enzyme";
import { HomeButton } from "../home_button";
import { HomeButtonProps } from "../interfaces";

describe("<HomeButton />", () => {
  const fakeProps = (): HomeButtonProps => ({
    doFindHome: false,
    disabled: false,
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
