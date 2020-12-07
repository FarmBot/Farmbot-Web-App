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
import { mount, shallow } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import { ControlsPopupProps } from "../controls/move/interfaces";
import { error } from "../toast/toast";
import { Actions, Content, ToolTips } from "../constants";

describe("<ControlsPopup />", () => {
  const fakeProps = (): ControlsPopupProps => ({
    dispatch: jest.fn(),
    axisInversion: { x: true, y: false, z: false },
    botPosition: { x: undefined, y: undefined, z: undefined },
    firmwareSettings: bot.hardware.mcu_params,
    xySwap: false,
    arduinoBusy: false,
    stepSize: 100,
    botOnline: true,
    env: {},
    doFindHome: false,
  });

  it("toggles open state", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    expect(wrapper.find(".controls-popup").hasClass("open")).toBeFalsy();
    wrapper.find("i").first().simulate("click");
    expect(wrapper.find(".controls-popup").hasClass("open")).toBeTruthy();
  });

  it("x axis is inverted", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    const button = wrapper.find("button").at(3);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
  });

  it("y axis is not inverted", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
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

  it("swaps axes", () => {
    const swappedProps = fakeProps();
    swappedProps.xySwap = true;
    swappedProps.axisInversion.x = false;
    const swapped = mount(<ControlsPopup {...swappedProps} />);
    swapped.find("i").first().simulate("click");
    expect(swapped.find(".controls-popup").hasClass("open")).toBeTruthy();
    const button = swapped.find("button").at(1);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
  });

  it("changes step size", () => {
    const p = fakeProps();
    const wrapper = shallow(<ControlsPopup {...p} />);
    wrapper.find("i").first().simulate("click");
    wrapper.find("FBSelect").simulate("change", { label: "", value: 1 });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHANGE_STEP_SIZE,
      payload: 1,
    });
  });

  it("takes photo", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    const btn = wrapper.find("button").at(6);
    expect(btn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("shows camera as disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const wrapper = mount(<ControlsPopup {...p} />);
    wrapper.find("i").first().simulate("click");
    const btn = wrapper.find("button").at(6);
    expect(btn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
    expect(mockDevice.takePhoto).not.toHaveBeenCalled();
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
