import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PinNumberDropdown } from "../pin_number_dropdown";
import { PinGuardMCUInputGroupProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFirmwareConfig, fakePeripheral,
} from "../../../__test_support__/fake_state/resources";
import { TaggedFirmwareConfig } from "farmbot";
import * as deviceActions from "../../../devices/actions";
import { DeviceSetting } from "../../../constants";
import * as ui from "../../../ui";

let updateMCUSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  updateMCUSpy = jest.spyOn(deviceActions, "updateMCU")
    .mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      selectedItem?: { label: string, value: number | string },
      customNullLabel?: string,
      extraClass?: string,
      onChange: (ddi: { label: string, value: number | string }) => void,
    }) =>
      <div>
        <span data-testid="selected-label">
          {props.selectedItem?.label || props.customNullLabel || ""}
        </span>
        <span data-testid="extra-class">{props.extraClass || ""}</span>
        <button onClick={() => props.onChange({ label: "", value: 2 })}>
          change-pin
        </button>
      </div>);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<PinNumberDropdown />", () => {
  const fakeProps =
    (firmwareConfig?: TaggedFirmwareConfig): PinGuardMCUInputGroupProps => ({
      label: DeviceSetting.pinGuard1,
      pinNumKey: "pin_guard_1_pin_nr",
      timeoutKey: "pin_guard_1_time_out",
      activeStateKey: "pin_guard_1_active_state",
      dispatch: jest.fn(),
      sourceFwConfig: x => ({
        value: (firmwareConfig || fakeFirmwareConfig()).body[x],
        consistent: true
      }),
      firmwareHardware: undefined,
      resources: buildResourceIndex(
        firmwareConfig ? [firmwareConfig] : []).index,
      disabled: false,
    });

  it("renders undefined", () => {
    render(<PinNumberDropdown {...fakeProps()} />);
    expect(screen.getByTestId("selected-label").textContent).toEqual("Select a pin");
    expect(screen.getByTestId("extra-class").textContent?.trim()).toEqual("");
  });

  it("renders disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    render(<PinNumberDropdown {...p} />);
    expect(screen.getByTestId("selected-label").textContent).toEqual("Select a pin");
    expect(screen.getByTestId("extra-class").textContent?.trim()).toEqual("disabled");
  });

  it("renders when inconsistent", () => {
    const p = fakeProps();
    p.sourceFwConfig = () => ({ value: 0, consistent: false });
    render(<PinNumberDropdown {...p} />);
    expect(screen.getByTestId("extra-class").textContent?.trim()).toEqual("dim");
  });

  it("renders pin label", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.pin_guard_1_pin_nr = 1;
    const p = fakeProps(firmwareConfig);
    p.resources = buildResourceIndex([firmwareConfig]).index;
    render(<PinNumberDropdown {...p} />);
    expect(screen.getByTestId("selected-label").textContent).toEqual("Pin 1");
  });

  it("renders peripheral label", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.pin_guard_1_pin_nr = 1;
    const p = fakeProps(firmwareConfig);
    const peripheral = fakePeripheral();
    peripheral.body.pin = 1;
    peripheral.body.label = "Peripheral 1";
    p.resources = buildResourceIndex([firmwareConfig, peripheral]).index;
    render(<PinNumberDropdown {...p} />);
    expect(screen.getByTestId("selected-label").textContent).toEqual("Peripheral 1");
  });

  it("changes pin number", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.pin_guard_1_pin_nr = 1;
    const p = fakeProps(firmwareConfig);
    p.resources = buildResourceIndex([firmwareConfig]).index;
    render(<PinNumberDropdown {...p} />);
    fireEvent.click(screen.getByText("change-pin"));
    expect(updateMCUSpy).toHaveBeenCalledWith("pin_guard_1_pin_nr", "2");
  });
});
