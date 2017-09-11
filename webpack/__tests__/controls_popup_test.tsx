jest.mock("../device", () => ({
  devices: {
    current: {
      moveRelative: jest.fn(() => { return Promise.resolve(); }),
    }
  }
}));

import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { mount } from "enzyme";
import { devices } from "../device";

describe("<ControlsPopup />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const wrapper = mount(<ControlsPopup
    dispatch={jest.fn()}
    axisInversion={{ x: true, y: false, z: false }} />);

  it("Has a false initial state", () => {
    expect(wrapper.state("isOpen")).toBeFalsy();
  });

  it("Toggles state", () => {
    const parent = wrapper.find("i").first();
    parent.simulate("click");
    expect(wrapper.state("isOpen")).toBeTruthy();
  });

  it("x axis is inverted", () => {
    const { mock } = devices.current.moveRelative as jest.Mock<{}>;
    const button = wrapper.find("button").first();
    expect(button.props().title).toBe("move x axis");
    button.simulate("click");
    const args = mock.calls[0][0];
    expect(args.x).toBe(100);
    expect(args.y).toBe(0);
    expect(args.z).toBe(0);
  });

  it("y axis is not inverted", () => {
    const { mock } = devices.current.moveRelative as jest.Mock<{}>;
    const button = wrapper.find("button").at(2);
    expect(button.props().title).toBe("move y axis");
    button.simulate("click");
    const args = mock.calls[0][0];
    expect(args.x).toBe(0);
    expect(args.y).toBe(100);
    expect(args.z).toBe(0);
  });

  it("disabled when closed", () => {
    const { mock } = devices.current.moveRelative as jest.Mock<{}>;
    wrapper.setState({ isOpen: false });
    [0, 1, 2, 3].map((i) => wrapper.find("button").at(i).simulate("click"));
    expect(mock.calls.length).toBe(0);
  });
});
