let mockPath = "";
jest.mock("../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { getCurrentLocation: () => ({ pathname: mockPath }) }
}));

const mockDevice = {
  moveRelative: jest.fn((_) => Promise.resolve()),
  takePhoto: jest.fn(() => Promise.resolve()),
};
jest.mock("../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { ControlsPopup, showControlsPopup } from "../controls_popup";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import { ControlsPopupProps } from "../controls/move/interfaces";

describe("<ControlsPopup />", () => {
  const fakeProps = (): ControlsPopupProps => ({
    dispatch: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    firmwareSettings: bot.hardware.mcu_params,
    getConfigValue: () => false,
    arduinoBusy: false,
    stepSize: 100,
    botOnline: true,
    env: {},
  });

  it("toggles open state", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    expect(wrapper.find(".controls-popup").hasClass("open")).toBeFalsy();
    wrapper.find("img").first().simulate("click");
    expect(wrapper.find(".controls-popup").hasClass("open")).toBeTruthy();
  });

  it("sends movement command", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.find("img").first().simulate("click");
    const button = wrapper.find("button").at(1);
    expect(button.props().title).toBe("move y axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 0, y: 100, z: 0 });
  });

  it("disabled when closed", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    expect(wrapper.find(".controls-popup").hasClass("open")).toBeFalsy();
    [0, 1, 2, 3].map((i) => wrapper.find("button").at(i).simulate("click"));
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });
});

describe("showControlsPopup()", () => {
  it.each<["shows" | "doesn't show", string]>([
    ["shows", "designer"],
    ["shows", "designer/plants"],
    ["doesn't show", "designer/controls"],
    ["shows", "device"],
    ["shows", "sequences"],
    ["shows", "sequences/for_regimens"],
    ["doesn't show", "regimens"],
    ["shows", "tools"],
    ["shows", "farmware"],
    ["shows", "messages"],
    ["shows", "logs"],
    ["shows", "help"],
    ["shows", ""],
    ["doesn't show", "account"],
  ])("%s controls pop-up on %s page", (expected, page) => {
    mockPath = "/app/" + page;
    expect(showControlsPopup()).toEqual(expected == "shows");
  });
});
