const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); })
};

jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));
jest.mock("farmbot-toastr", () => ({
  success: jest.fn(),
  info: jest.fn(),
  error: jest.fn()
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { BoardType } from "../board_type";
import { BoardTypeProps } from "../interfaces";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<BoardType/>", () => {
  const fakeProps = (): BoardTypeProps => {
    return {
      firmwareVersion: "",
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      },
      shouldDisplay: () => false,
    };
  };

  it("Farmduino", () => {
    const p = fakeProps();
    p.firmwareVersion = "5.0.3.F";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Farmduino");
  });

  it("Farmduino k1.4", () => {
    const p = fakeProps();
    p.firmwareVersion = "5.0.3.G";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("1.4");
  });

  it("Arduino/RAMPS", () => {
    const p = fakeProps();
    p.firmwareVersion = "5.0.3.R";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Arduino/RAMPS");
  });

  it("Undefined", () => {
    const p = fakeProps();
    p.firmwareVersion = undefined;
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("None");
  });

  it("Disconnected", () => {
    const p = fakeProps();
    p.firmwareVersion = "Arduino Disconnected!";
    expect(mount(<BoardType {...p} />).text()).toContain("None");
    p.firmwareVersion = "disconnected";
    expect(mount(<BoardType {...p} />).text()).toContain("None");
  });

  it("Stubbed", () => {
    const p = fakeProps();
    p.firmwareVersion = "STUBFW";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("None");
  });

  it("Disconnected with valid FirmwareConfig", () => {
    const p = fakeProps();
    p.firmwareVersion = "Arduino Disconnected!";
    p.sourceFbosConfig = () => ({ value: "farmduino", consistent: false });
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Farmduino");
  });

  it("calls updateConfig", () => {
    const p = fakeProps();
    p.firmwareVersion = "Arduino Disconnected!";
    const wrapper = shallow(<BoardType {...p} />);
    wrapper.find("FBSelect").simulate("change",
      { label: "firmware_hardware", value: "farmduino" });
    expect(mockDevice.updateConfig)
      .toBeCalledWith({ firmware_hardware: "farmduino" });
  });

  it("displays standard boards", () => {
    const wrapper = shallow(<BoardType {...fakeProps()} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
      { label: "Farmduino (Genesis v1.3)", value: "farmduino" }]);
  });

  it("displays new board", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<BoardType {...p} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
      { label: "Farmduino (Genesis v1.3)", value: "farmduino" },
      { label: "Farmduino (Genesis v1.4)", value: "farmduino_k14" }]);
  });
});
