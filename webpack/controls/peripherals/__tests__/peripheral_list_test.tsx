jest.mock("../../../device", () => ({
  devices: {
    current: {
      togglePin: jest.fn(() => { return Promise.resolve(); })
    }
  }
}));

import * as React from "react";
import { mount } from "enzyme";
import { PeripheralList } from "../peripheral_list";
import { TaggedPeripheral } from "../../../resources/tagged_resources";
import { Pins } from "farmbot/dist";
import { devices } from "../../../device";

describe("<PeripheralList/>", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const peripherals: TaggedPeripheral[] = [
    {
      uuid: "peripherals.2.2",
      kind: "peripherals",
      body: {
        id: 2,
        pin: 13,
        label: "GPIO 13 - LED"
      }
    },
    {
      uuid: "peripherals.1.1",
      kind: "peripherals",
      body: {
        id: 1,
        pin: 2,
        label: "GPIO 2"
      }
    },
  ];

  const pins: Pins = {
    13: {
      mode: 0,
      value: 1
    },
    2: {
      mode: 0,
      value: 0
    }
  };

  it("renders a list of peripherals, in sorted order", function () {
    let wrapper = mount(<PeripheralList dispatch={() => { }}
      peripherals={peripherals}
      pins={pins} />);
    let labels = wrapper.find("label");
    let buttons = wrapper.find("button");
    let first = labels.first();
    expect(first.text()).toBeTruthy();
    expect(first.text()).toEqual("GPIO 2");
    expect(buttons.first().text()).toEqual("off");
    let last = labels.last();
    expect(last.text()).toBeTruthy();
    expect(last.text()).toEqual("GPIO 13 - LED");
    expect(buttons.last().text()).toEqual("on");
  });

  it("toggles pins", () => {
    let { mock } = devices.current.togglePin as jest.Mock<{}>;
    let wrapper = mount(<PeripheralList dispatch={() => { }}
      peripherals={peripherals}
      pins={pins} />);
    let toggle = wrapper.find("ToggleButton");
    toggle.first().simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0].pin_number).toEqual(2);
    toggle.last().simulate("click");
    expect(mock.calls.length).toEqual(2);
    expect(mock.calls[1][0].pin_number).toEqual(13);
  });
});
