let mockPhotoOutcome = Promise.resolve();
const mockDevice = {
  home: jest.fn(() => { return Promise.resolve(); }),
  findHome: jest.fn(() => { return Promise.resolve(); }),
  takePhoto: jest.fn(() => { return mockPhotoOutcome; }),
  moveRelative: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { JogButtons } from "../jog_buttons";
import { JogMovementControlsProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { error } from "../../../toast/toast";
import { Content, ToolTips } from "../../../constants";

describe("<JogButtons/>", function () {
  const jogButtonProps = (): JogMovementControlsProps => {
    return {
      stepSize: 100,
      botPosition: { x: undefined, y: undefined, z: undefined },
      axisInversion: { x: false, y: false, z: false },
      arduinoBusy: false,
      firmwareSettings: bot.hardware.mcu_params,
      xySwap: false,
      doFindHome: false,
      env: {},
    };
  };

  it("calls home command", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps()} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mockDevice.home).toHaveBeenCalledTimes(1);
  });

  it("calls find home command", () => {
    const p = jogButtonProps();
    p.doFindHome = true;
    const jogButtons = mount(<JogButtons {...p} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mockDevice.findHome).toHaveBeenCalledTimes(1);
  });

  it("is disabled", () => {
    const p = jogButtonProps();
    p.arduinoBusy = true;
    const jogButtons = mount(<JogButtons {...p} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mockDevice.home).not.toHaveBeenCalled();
  });

  it("call has correct args", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps()} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mockDevice.home)
      .toHaveBeenCalledWith({ axis: "all", speed: 100 });
  });

  it("takes photo", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps()} />);
    const cameraBtn = jogButtons.find("button").at(0);
    expect(cameraBtn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);

    cameraBtn.simulate("click");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("error taking photo", () => {
    mockPhotoOutcome = Promise.reject();
    const jogButtons = mount(<JogButtons {...jogButtonProps()} />);
    jogButtons.find("button").at(0).simulate("click");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
  });

  it("shows camera as disabled", () => {
    const p = jogButtonProps();
    p.env = { camera: "NONE" };
    const jogButtons = mount(<JogButtons {...p} />);
    const cameraBtn = jogButtons.find("button").at(0);
    expect(cameraBtn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    cameraBtn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, Content.NO_CAMERA_SELECTED);
    expect(mockDevice.takePhoto).not.toHaveBeenCalled();
  });

  it("has unswapped xy jog buttons", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps()} />);
    const button = jogButtons.find("button").at(6);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
  });

  it("has swapped xy jog buttons", () => {
    const p = jogButtonProps();
    (p.stepSize as number | undefined) = undefined;
    p.xySwap = true;
    const jogButtons = mount(<JogButtons {...p} />);
    const button = jogButtons.find("button").at(6);
    expect(button.props().title).toBe("move y axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 0, y: 100, z: 0 });
  });
});
