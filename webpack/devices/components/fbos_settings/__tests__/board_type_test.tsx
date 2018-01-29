const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); })
};

jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));
const mockToast = jest.fn();
jest.mock("farmbot-toastr", () => ({
  success: mockToast,
  info: mockToast,
  error: mockToast
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
      }
    };
  };

  it("Farmduino", () => {
    const p = fakeProps();
    p.firmwareVersion = "5.0.3.F";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Farmduino");
  });

  it("Arduino/RAMPS", () => {
    const p = fakeProps();
    p.firmwareVersion = "5.0.3.R";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Arduino/RAMPS");
  });

  it("Other", () => {
    const p = fakeProps();
    p.firmwareVersion = "4.0.2";
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
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("None");
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
});
