const mockDevice = {
  send: jest.fn(() => { return Promise.resolve(); })
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { SensorList } from "../sensor_list";
import { Pins } from "farmbot/dist";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";
import { SensorListProps } from "../interfaces";

describe("<SensorList/>", function () {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fakeProps = (): SensorListProps => {
    const pins: Pins = {
      50: {
        mode: 0,
        value: 1
      },
      51: {
        mode: 1,
        value: 500
      }
    };
    const fakeSensor1 = fakeSensor();
    const fakeSensor2 = fakeSensor();
    fakeSensor1.body.id = 1;
    fakeSensor1.body.pin = 51;
    fakeSensor1.body.mode = 1;
    fakeSensor1.body.label = "GPIO 51";
    fakeSensor2.body.id = 2;
    fakeSensor2.body.pin = 50;
    fakeSensor2.body.mode = 0;
    fakeSensor2.body.label = "GPIO 50 - Moisture";
    return {
      dispatch: jest.fn(),
      sensors: [fakeSensor2, fakeSensor1],
      pins,
      disabled: false
    };
  };

  it("renders a list of sensors, in sorted order", function () {
    const wrapper = mount(<SensorList {...fakeProps()} />);
    const labels = wrapper.find("label");
    const pinNumbers = wrapper.find("p");
    expect(labels.first().text()).toEqual("GPIO 51");
    expect(pinNumbers.first().text()).toEqual("51");
    expect(wrapper.find(".indicator").first().text()).toEqual("500");
    expect(labels.last().text()).toEqual("GPIO 50 - Moisture");
    expect(pinNumbers.last().text()).toEqual("50");
    expect(wrapper.find(".indicator").last().text()).toEqual("1");
  });

  const expectedPayload = (pin_number: number, pin_mode: 0 | 1) =>
    expect.objectContaining({
      kind: "rpc_request",
      args: expect.objectContaining({ label: expect.any(String) }),
      body: [expect.objectContaining({
        kind: "read_pin",
        args: {
          pin_number,
          label: `pin${pin_number}`,
          pin_mode
        }
      })]
    });

  it("reads pins", () => {
    const wrapper = mount(<SensorList {...fakeProps()} />);
    const toggle = wrapper.find("button");
    toggle.first().simulate("click");
    expect(mockDevice.send).toHaveBeenCalledWith(expectedPayload(51, 1));
    toggle.last().simulate("click");
    expect(mockDevice.send).toHaveBeenLastCalledWith(expectedPayload(50, 0));
    expect(mockDevice.send).toHaveBeenCalledTimes(2);
  });

  it("pins toggles are disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const wrapper = mount(<SensorList {...p} />);
    const toggle = wrapper.find("button");
    toggle.first().simulate("click");
    toggle.last().simulate("click");
    expect(mockDevice.send).not.toHaveBeenCalled();
  });
});
