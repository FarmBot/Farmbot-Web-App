import React from "react";
import { fireEvent, render, within } from "@testing-library/react";
import { act, create as createRenderer } from "react-test-renderer";
import {
  PeripheralList, AnalogSlider, AnalogSliderProps,
} from "../peripheral_list";
import {
  TaggedPeripheral, SpecialStatus, Pins, ANALOG,
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

  const getToggleButton = (container: HTMLElement, labelText: string) => {
    const label = within(container).getByText(labelText);
    const row = label.parentElement as HTMLElement;
    return within(row).getByRole("button");
  };

  it("renders a list of peripherals, in sorted order", () => {
    const { container } = render(<PeripheralList {...fakeProps()} />);
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    const pinNumbers = container.querySelectorAll("p");
    expect(labels[0]?.textContent).toBeTruthy();
    expect(labels[0]?.textContent).toEqual("GPIO 2");
    expect(pinNumbers[0]?.textContent).toEqual("2");
    expect(buttons[0]?.textContent).toMatch(/^(0|off)$/);
    const last = labels[labels.length - 1];
    expect(last?.textContent).toBeTruthy();
    expect(last?.textContent).toEqual("GPIO 13 - LED");
    expect(pinNumbers[pinNumbers.length - 1]?.textContent).toEqual("13");
    expect(buttons[buttons.length - 1]?.textContent).toMatch(/^(1|on)$/);
  });

  it("renders analog peripherals", () => {
    const p = fakeProps();
    p.peripherals[0].body.mode = 1;
    const { container } = render(<PeripheralList {...p} />);
    const slider = within(container).getByRole("slider");
    expect(slider).toBeInTheDocument();
  });

  it("toggles pins", () => {
    const { container } = render(<PeripheralList {...fakeProps()} />);
    const toggle2 = getToggleButton(container, "GPIO 2");
    fireEvent.click(toggle2);
    expect(deviceActions.pinToggle).toHaveBeenCalledWith(2);
    const toggle13 = getToggleButton(container, "GPIO 13 - LED");
    fireEvent.click(toggle13);
    expect(deviceActions.pinToggle).toHaveBeenLastCalledWith(13);
    expect(deviceActions.pinToggle).toHaveBeenCalledTimes(2);
  });

  it("pins toggles are disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const { container } = render(<PeripheralList {...p} />);
    const toggle2 = getToggleButton(container, "GPIO 2");
    expect(toggle2).toBeDisabled();
    const toggle13 = getToggleButton(container, "GPIO 13 - LED");
    expect(toggle13).toBeDisabled();
  });

  it("shows status as unknown", () => {
    const p = fakeProps();
    p.pins = {};
    forceOnlineSpy.mockReturnValue(false);
    const { container } = render(<PeripheralList {...p} />);
    const toggle = getToggleButton(container, "GPIO 2");
    expect(toggle).not.toHaveTextContent("off");
  });

  it("shows status as off for demo accounts", () => {
    localStorage.setItem("myBotIs", "online");
    const p = fakeProps();
    p.pins = {};
    forceOnlineSpy.mockReturnValue(true);
    const { container } = render(<PeripheralList {...p} />);
    const toggle = getToggleButton(container, "GPIO 2");
    expect(toggle.textContent).toMatch(/^(0|off)$/);
  });
});

describe("<AnalogSlider />", () => {
  const fakeProps = (): AnalogSliderProps => ({
    disabled: undefined,
    pin: undefined,
    initialValue: undefined,
  });

  it("changes value", () => {
    const renderer = createRenderer(<AnalogSlider {...fakeProps()} />);
    const slider = renderer.root.findByType(Slider);
    act(() => {
      slider.props.onChange(128);
    });
    const instance = renderer.getInstance() as AnalogSlider;
    expect(instance.state.value).toEqual(128);
  });

  it("sends value", () => {
    const p = fakeProps();
    p.pin = 13;
    const renderer = createRenderer(<AnalogSlider {...p} />);
    const slider = renderer.root.findByType(Slider);
    act(() => {
      slider.props.onRelease(128);
    });
    expect(deviceActions.writePin).toHaveBeenCalledWith(13, 128, ANALOG);
  });

  it("doesn't send value", () => {
    const renderer = createRenderer(<AnalogSlider {...fakeProps()} />);
    const slider = renderer.root.findByType(Slider);
    act(() => {
      slider.props.onRelease(128);
    });
    expect(deviceActions.writePin).not.toHaveBeenCalled();
  });

  it("renders read value", () => {
    const p = fakeProps();
    p.initialValue = 255;
    const renderer = createRenderer(<AnalogSlider {...p} />);
    const initialSlider = renderer.root.findByType(Slider);
    expect(initialSlider.props.value).toEqual(255);
    act(() => {
      initialSlider.props.onChange(128);
    });
    const nextSlider = renderer.root.findByType(Slider);
    expect(nextSlider.props.value).toEqual(128);
  });
});
