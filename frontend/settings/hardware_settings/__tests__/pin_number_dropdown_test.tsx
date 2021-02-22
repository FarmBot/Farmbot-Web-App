jest.mock("../../../devices/actions", () => ({ updateMCU: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { PinNumberDropdown } from "../pin_number_dropdown";
import { PinGuardMCUInputGroupProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFirmwareConfig, fakePeripheral,
} from "../../../__test_support__/fake_state/resources";
import { TaggedFirmwareConfig } from "farmbot";
import { FBSelect } from "../../../ui";
import { updateMCU } from "../../../devices/actions";
import { DeviceSetting } from "../../../constants";

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
    const wrapper = mount(<PinNumberDropdown {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Select a pin");
    expect(wrapper.find(FBSelect).props().extraClass?.trim()).toEqual("");
  });

  it("renders disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const wrapper = mount(<PinNumberDropdown {...p} />);
    expect(wrapper.text()).toEqual("Select a pin");
    expect(wrapper.find(FBSelect).props().extraClass?.trim()).toEqual("disabled");
  });

  it("renders when inconsistent", () => {
    const p = fakeProps();
    p.sourceFwConfig = () => ({ value: 0, consistent: false });
    const wrapper = mount(<PinNumberDropdown {...p} />);
    expect(wrapper.find(FBSelect).props().extraClass?.trim()).toEqual("dim");
  });

  it("renders pin label", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.pin_guard_1_pin_nr = 1;
    const p = fakeProps(firmwareConfig);
    p.resources = buildResourceIndex([firmwareConfig]).index;
    const wrapper = mount(<PinNumberDropdown {...p} />);
    expect(wrapper.text()).toEqual("Pin 1");
  });

  it("renders peripheral label", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.pin_guard_1_pin_nr = 1;
    const p = fakeProps(firmwareConfig);
    const peripheral = fakePeripheral();
    peripheral.body.pin = 1;
    peripheral.body.label = "Peripheral 1";
    p.resources = buildResourceIndex([firmwareConfig, peripheral]).index;
    const wrapper = mount(<PinNumberDropdown {...p} />);
    expect(wrapper.text()).toEqual("Peripheral 1");
  });

  it("changes pin number", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.pin_guard_1_pin_nr = 1;
    const p = fakeProps(firmwareConfig);
    p.resources = buildResourceIndex([firmwareConfig]).index;
    const wrapper = shallow(<PinNumberDropdown {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: 2 });
    expect(updateMCU).toHaveBeenCalledWith("pin_guard_1_pin_nr", "2");
  });
});
