const mockDevice = {
  moveRelative: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";

describe("<ControlsPopup />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const wrapper = mount(<ControlsPopup
    dispatch={jest.fn()}
    axisInversion={{ x: true, y: false, z: false }}
    botPosition={{ x: undefined, y: undefined, z: undefined }}
    mcuParams={bot.hardware.mcu_params}
    xySwap={false} />);

  it("Has a false initial state", () => {
    expect(wrapper.state("isOpen")).toBeFalsy();
  });

  it("Toggles state", () => {
    const parent = wrapper.find("i").first();
    parent.simulate("click");
    expect(wrapper.state("isOpen")).toBeTruthy();
  });

  it("x axis is inverted", () => {
    const button = wrapper.find("button").at(3);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ speed: 100, x: 100, y: 0, z: 0 });
  });

  it("y axis is not inverted", () => {
    const button = wrapper.find("button").at(1);
    expect(button.props().title).toBe("move y axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ speed: 100, x: 0, y: 100, z: 0 });
  });

  it("disabled when closed", () => {
    wrapper.setState({ isOpen: false });
    [0, 1, 2, 3].map((i) => wrapper.find("button").at(i).simulate("click"));
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("swaps axes", () => {
    const swapped = mount(<ControlsPopup
      dispatch={jest.fn()}
      axisInversion={{ x: false, y: false, z: false }}
      botPosition={{ x: undefined, y: undefined, z: undefined }}
      mcuParams={bot.hardware.mcu_params}
      xySwap={true} />);
    swapped.setState({ isOpen: true });
    expect(swapped.state("isOpen")).toBeTruthy();
    const button = swapped.find("button").at(1);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ speed: 100, x: 100, y: 0, z: 0 });
  });
});
