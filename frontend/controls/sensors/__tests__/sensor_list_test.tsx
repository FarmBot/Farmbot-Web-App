const mockDevice = { readPin: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import * as React from "react";
import { mount } from "enzyme";
import { SensorList } from "../sensor_list";
import { Pins } from "farmbot/dist";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";
import { SensorListProps } from "../interfaces";

describe("<SensorList/>", function () {
  const fakeProps = (): SensorListProps => {
    const pins: Pins = {
      50: {
        mode: 1,
        value: 500,
      },
      51: {
        mode: 0,
        value: 1,
      },
      52: {
        mode: 0,
        value: 1,
      },
      53: {
        mode: 0,
        value: 0,
      },
    };
    const fakeSensor1 = fakeSensor();
    const fakeSensor2 = fakeSensor();
    const fakeSensor3 = fakeSensor();
    const fakeSensor4 = fakeSensor();
    fakeSensor1.body.id = 1;
    fakeSensor1.body.pin = 51;
    fakeSensor1.body.mode = 0;
    fakeSensor1.body.label = "GPIO 51";
    fakeSensor2.body.id = 2;
    fakeSensor2.body.pin = 50;
    fakeSensor2.body.mode = 1;
    fakeSensor2.body.label = "GPIO 50 - Moisture";
    fakeSensor3.body.id = 3;
    fakeSensor3.body.pin = 52;
    fakeSensor3.body.mode = 0;
    fakeSensor3.body.label = "GPIO 52 - Tool Verification";
    fakeSensor4.body.id = 4;
    fakeSensor4.body.pin = 53;
    fakeSensor4.body.mode = 0;
    fakeSensor4.body.label = "GPIO 53 - Tool Verification";
    return {
      dispatch: jest.fn(),
      sensors: [fakeSensor2, fakeSensor1, fakeSensor3, fakeSensor4],
      pins,
      disabled: false
    };
  };

  it("renders a list of sensors, in sorted order", function () {
    const wrapper = mount(<SensorList {...fakeProps()} />);
    const labels = wrapper.find("label");
    const pinNumbers = wrapper.find("p");
    expect(labels.at(0).text()).toEqual("GPIO 51");
    expect(pinNumbers.at(0).text()).toEqual("51");
    expect(wrapper.find(".indicator").at(0).text()).toEqual("1");
    expect(labels.at(1).text()).toEqual("GPIO 50 - Moisture");
    expect(pinNumbers.at(1).text()).toEqual("50");
    expect(wrapper.find(".indicator").at(1).text()).toEqual("500");
    expect(labels.at(2).text()).toEqual("GPIO 52 - Tool Verification");
    expect(pinNumbers.at(2).text()).toEqual("52");
    expect(wrapper.find(".indicator").at(2).text()).toEqual("1 (NO TOOL)");
    expect(labels.at(3).text()).toEqual("GPIO 53 - Tool Verification");
    expect(pinNumbers.at(3).text()).toEqual("53");
    expect(wrapper.find(".indicator").at(3).text()).toEqual("0 (TOOL ON)");
  });

  const expectedPayload = (pin_number: number, pin_mode: 0 | 1) =>
    ({
      pin_number,
      label: `pin${pin_number}`,
      pin_mode
    });

  it("reads sensors", () => {
    const wrapper = mount(<SensorList {...fakeProps()} />);
    const readSensorBtn = wrapper.find("button");
    readSensorBtn.at(0).simulate("click");
    expect(mockDevice.readPin).toHaveBeenCalledWith(expectedPayload(51, 0));
    readSensorBtn.at(1).simulate("click");
    expect(mockDevice.readPin).toHaveBeenLastCalledWith(expectedPayload(50, 1));
    expect(mockDevice.readPin).toHaveBeenCalledTimes(2);
  });

  it("sensor reading is disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const wrapper = mount(<SensorList {...p} />);
    const readSensorBtn = wrapper.find("button");
    readSensorBtn.first().simulate("click");
    readSensorBtn.last().simulate("click");
    expect(mockDevice.readPin).not.toHaveBeenCalled();
  });

  it("renders analog reading", () => {
    const p = fakeProps();
    p.pins[50] && (p.pins[50].value = 600);
    const wrapper = mount(<SensorList {...p} />);
    expect(wrapper.html()).toContain("margin-left: -3.5rem");
  });
});
