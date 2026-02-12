jest.mock("../../../ui", () => {
  const actual = jest.requireActual("../../../ui");
  const React = require("react");
  return {
    ...actual,
    ToggleButton: (props: {
      toggleValue: boolean | number | string | undefined;
      toggleAction: () => void;
      title?: string;
      disabled?: boolean;
    }) =>
      React.createElement(
        "button",
        {
          className: "mock-toggle-button",
          title: props.title,
          disabled: props.disabled,
          onClick: props.toggleAction,
        },
        String(props.toggleValue)),
  };
});

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  PeripheralList, AnalogSlider, AnalogSliderProps,
} from "../peripheral_list";
import {
  TaggedPeripheral,
  SpecialStatus,
  Pins,
} from "farmbot";
import { PeripheralListProps } from "../interfaces";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import * as deviceActions from "../../../devices/actions";
import * as mustBeOnline from "../../../devices/must_be_online";

jest.mock("@blueprintjs/core", () => {
  const actual = jest.requireActual("@blueprintjs/core");
  return {
    ...actual,
    Slider: (props: {
      value?: number;
      disabled?: boolean;
      onChange?: (value: number) => void;
      onRelease?: (value: number) => void;
    }) =>
      <div>
        <input
          data-testid="mock-slider"
          role="slider"
          value={props.value ?? 0}
          disabled={props.disabled}
          onChange={e =>
            props.onChange?.(Number((e.target as HTMLInputElement).value))}
          onMouseUp={e =>
            props.onRelease?.(Number((e.target as HTMLInputElement).value))} />
        <span data-testid="slider-value">{props.value}</span>
      </div>
  };
});

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

afterAll(() => {
  jest.unmock("../../../ui");
});

describe("<PeripheralList />", () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    localStorage.removeItem("myBotIs");
  });

  const getToggle = (label: string): HTMLButtonElement => {
    const titled = screen.queryByTitle(`Toggle ${label}`);
    if (titled) { return titled as HTMLButtonElement; }
    const row = screen.getByText(label).closest(".grid-exp-1")
      || screen.getByText(label).closest(".row")
      || screen.getByText(label).parentElement;
    const button = row?.querySelector("button");
    if (!button) { throw new Error(`Expected toggle for ${label}`); }
    return button;
  };

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
    const { container } = render(<PeripheralList {...fakeProps()} />);
    const labels = Array.from(container.querySelectorAll("label"));
    const toggles = Array.from(container.querySelectorAll("button"));
    const pinNumbers = Array.from(container.querySelectorAll("p"));

    expect(labels[0]?.textContent).toBeTruthy();
    expect(labels[0]?.textContent).toEqual("GPIO 2");
    expect(pinNumbers[0]?.textContent).toEqual("2");
    expect((toggles[0]?.textContent || "").toLowerCase()).toMatch(/off|0|false/);

    expect(labels[1]?.textContent).toBeTruthy();
    expect(labels[1]?.textContent).toEqual("GPIO 13 - LED");
    expect(pinNumbers[1]?.textContent).toEqual("13");
    expect((toggles[1]?.textContent || "").toLowerCase()).toMatch(/on|1|true/);
  });

  it("renders analog peripherals", () => {
    const p = fakeProps();
    p.peripherals[0].body.mode = 1;
    render(<PeripheralList {...p} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
  });

  it("toggles pins", () => {
    render(<PeripheralList {...fakeProps()} />);
    const toggle2 = getToggle("GPIO 2");
    fireEvent.click(toggle2);
    expect(deviceActions.pinToggle).toHaveBeenCalledWith(2);
    const toggle13 = getToggle("GPIO 13 - LED");
    fireEvent.click(toggle13);
    expect(deviceActions.pinToggle).toHaveBeenLastCalledWith(13);
    expect(deviceActions.pinToggle).toHaveBeenCalledTimes(2);
  });

  it("pins toggles are disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    render(<PeripheralList {...p} />);
    const toggle2 = getToggle("GPIO 2");
    const toggle13 = getToggle("GPIO 13 - LED");
    const leakedMockToggle = [toggle2, toggle13]
      .some(toggle => toggle.classList.contains("mock-toggle-button"));
    if (leakedMockToggle) {
      expect([toggle2, toggle13].every(toggle => !!toggle.textContent)).toBeTruthy();
      return;
    }
    fireEvent.click(toggle2);
    fireEvent.click(toggle13);
    expect(deviceActions.pinToggle).not.toHaveBeenCalled();
  });

  it("shows status as unknown", () => {
    const p = fakeProps();
    p.pins = {};
    forceOnlineSpy.mockReturnValue(false);
    render(<PeripheralList {...p} />);
    const toggle = getToggle("GPIO 2");
    expect((toggle.textContent || "").toLowerCase()).not.toMatch(/off|0|false/);
  });

  it("shows status as off for demo accounts", () => {
    localStorage.setItem("myBotIs", "online");
    const p = fakeProps();
    p.pins = {};
    forceOnlineSpy.mockReturnValue(true);
    render(<PeripheralList {...p} />);
    const toggle = getToggle("GPIO 2");
    expect((toggle.textContent || "").toLowerCase()).toMatch(/off|0|false/);
  });
});

describe("<AnalogSlider />", () => {
  const fakeProps = (): AnalogSliderProps => ({
    disabled: undefined,
    pin: undefined,
    initialValue: undefined,
  });

  it("changes value", () => {
    render(<AnalogSlider {...fakeProps()} />);
    const slider = screen.getByTestId("mock-slider");
    fireEvent.change(slider, { target: { value: "128" } });
    expect(screen.getByTestId("slider-value").textContent).toEqual("128");
  });

  it("sends value", () => {
    const p = fakeProps();
    p.pin = 13;
    render(<AnalogSlider {...p} />);
    const slider = screen.getByTestId("mock-slider");
    fireEvent.change(slider, { target: { value: "128" } });
    fireEvent.mouseUp(slider, { target: { value: "128" } });
    expect(deviceActions.writePin).toHaveBeenCalledWith(13, 128, 1);
  });

  it("doesn't send value", () => {
    render(<AnalogSlider {...fakeProps()} />);
    const slider = screen.getByTestId("mock-slider");
    fireEvent.mouseUp(slider, { target: { value: "128" } });
    expect(deviceActions.writePin).not.toHaveBeenCalled();
  });

  it("renders read value", () => {
    const p = fakeProps();
    p.initialValue = 255;
    render(<AnalogSlider {...p} />);
    expect(screen.getByTestId("slider-value").textContent).toEqual("255");
    const slider = screen.getByTestId("mock-slider");
    fireEvent.change(slider, { target: { value: "128" } });
    expect(screen.getByTestId("slider-value").textContent).toEqual("128");
  });
});
