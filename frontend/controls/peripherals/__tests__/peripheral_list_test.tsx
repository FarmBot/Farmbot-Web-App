import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { mount, shallow } from "enzyme";
import {
  PeripheralList, AnalogSlider, AnalogSliderProps,
} from "../peripheral_list";
import {
  TaggedPeripheral,
  SpecialStatus,
  Pins,
} from "farmbot";
import { PeripheralListProps } from "../interfaces";
import { Slider } from "@blueprintjs/core";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import * as deviceActions from "../../../devices/actions";
import * as mustBeOnline from "../../../devices/must_be_online";

let pinToggleSpy: jest.SpyInstance;
let writePinSpy: jest.SpyInstance;
let forceOnlineSpy: jest.SpyInstance;

beforeEach(() => {
  pinToggleSpy = jest.spyOn(deviceActions, "pinToggle").mockImplementation(jest.fn());
  writePinSpy = jest.spyOn(deviceActions, "writePin").mockImplementation(jest.fn());
  forceOnlineSpy = jest.spyOn(mustBeOnline, "forceOnline").mockReturnValue(false);
});

afterEach(() => {
  pinToggleSpy.mockRestore();
  writePinSpy.mockRestore();
  forceOnlineSpy.mockRestore();
});

describe("<PeripheralList />", () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    localStorage.removeItem("myBotIs");
  });

  const fakeProps = (): PeripheralListProps => {
    const peripherals: TaggedPeripheral[] = [
      {
        uuid: "Peripheral.2.2",
        kind: "Peripheral",
        specialStatus: SpecialStatus.SAVED,
        body: {
          id: 2,
          pin: 13,
          label: "GPIO 13 - LED",
          mode: 0,
        }
      },
      {
        uuid: "Peripheral.1.1",
        kind: "Peripheral",
        specialStatus: SpecialStatus.SAVED,
        body: {
          id: 1,
          pin: 2,
          label: "GPIO 2",
          mode: 0,
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
    return {
      dispatch: mockDispatch(),
      peripherals,
      pins,
      disabled: false,
      locked: false,
    };
  };

  it("renders a list of peripherals, in sorted order", () => {
    const wrapper = mount(<PeripheralList {...fakeProps()} />);
    const labels = wrapper.find("label");
    const buttons = wrapper.find("button");
    const pinNumbers = wrapper.find("p");
    const first = labels.first();
    expect(first.text()).toBeTruthy();
    expect(first.text()).toEqual("GPIO 2");
    expect(pinNumbers.first().text()).toEqual("2");
    expect(buttons.first().text()).toEqual("off");
    const last = labels.last();
    expect(last.text()).toBeTruthy();
    expect(last.text()).toEqual("GPIO 13 - LED");
    expect(pinNumbers.last().text()).toEqual("13");
    expect(buttons.last().text()).toEqual("on");
    wrapper.unmount();
  });

  it("renders analog peripherals", () => {
    const p = fakeProps();
    p.peripherals[0].body.mode = 1;
    const { container } = render(<PeripheralList {...p} />);
    const slider = within(container).getByRole("slider");
    expect(slider).toBeInTheDocument();
  });

  it("toggles pins", () => {
    render(<PeripheralList {...fakeProps()} />);
    const toggle2 = screen.getByTitle("Toggle GPIO 2");
    fireEvent.click(toggle2);
    expect(deviceActions.pinToggle).toHaveBeenCalledWith(2);
    const toggle13 = screen.getByTitle("Toggle GPIO 13 - LED");
    fireEvent.click(toggle13);
    expect(deviceActions.pinToggle).toHaveBeenLastCalledWith(13);
    expect(deviceActions.pinToggle).toHaveBeenCalledTimes(2);
  });

  it("pins toggles are disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    render(<PeripheralList {...p} />);
    const toggle2 = screen.getByTitle("Toggle GPIO 2");
    fireEvent.click(toggle2);
    const toggle13 = screen.getByTitle("Toggle GPIO 13 - LED");
    fireEvent.click(toggle13);
    expect(deviceActions.pinToggle).not.toHaveBeenCalled();
  });

  it("shows status as unknown", () => {
    const p = fakeProps();
    p.pins = {};
    forceOnlineSpy.mockReturnValue(false);
    render(<PeripheralList {...p} />);
    const toggle = screen.getByTitle("Toggle GPIO 2");
    expect(toggle).not.toHaveTextContent("off");
  });

  it("shows status as off for demo accounts", () => {
    localStorage.setItem("myBotIs", "online");
    const p = fakeProps();
    p.pins = {};
    forceOnlineSpy.mockReturnValue(true);
    render(<PeripheralList {...p} />);
    const toggle = screen.getByTitle("Toggle GPIO 2");
    expect(toggle).toHaveTextContent("off");
  });
});

describe("<AnalogSlider />", () => {
  const fakeProps = (): AnalogSliderProps => ({
    disabled: undefined,
    pin: undefined,
    initialValue: undefined,
  });

  it("changes value", () => {
    const wrapper = shallow<AnalogSlider>(<AnalogSlider {...fakeProps()} />);
    expect(wrapper.state().value).toEqual(0);
    wrapper.find(Slider).simulate("change", 128);
    expect(wrapper.state().value).toEqual(128);
  });

  it("sends value", () => {
    const p = fakeProps();
    p.pin = 13;
    const wrapper = shallow<AnalogSlider>(<AnalogSlider {...p} />);
    wrapper.find(Slider).simulate("release", 128);
    expect(deviceActions.writePin).toHaveBeenCalledWith(13, 128, 1);
  });

  it("doesn't send value", () => {
    const wrapper = shallow<AnalogSlider>(<AnalogSlider {...fakeProps()} />);
    wrapper.find(Slider).simulate("release", 128);
    expect(deviceActions.writePin).not.toHaveBeenCalled();
  });

  it("renders read value", () => {
    const p = fakeProps();
    p.initialValue = 255;
    const wrapper = shallow(<AnalogSlider {...p} />);
    expect(wrapper.find(Slider).props().value).toEqual(255);
    wrapper.find(Slider).simulate("change", 128);
    expect(wrapper.find(Slider).props().value).toEqual(128);
  });
});
