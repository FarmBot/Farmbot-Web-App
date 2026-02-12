import React from "react";
import { render } from "@testing-library/react";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { NumericMCUInputGroupProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";
import { bot } from "../../../__test_support__/fake_state/bot";
import { cloneDeep } from "lodash";
import * as mcuInputBoxModule from "../mcu_input_box";
import { McuParamName } from "farmbot";

const mcuInputBoxMock = jest.fn((props: {
  setting: McuParamName,
  sourceFwConfig: NumericMCUInputGroupProps["sourceFwConfig"],
  warnMin?: number,
  warning?: string,
}) => {
  const value = props.sourceFwConfig(props.setting).value;
  const showWarnMin = !!props.warnMin && !!value && value < props.warnMin;
  const showError = showWarnMin || !!props.warning;
  return <div className={"mcu-input-box-mock"}>
    {showError && <div className={"error"} />}
  </div>;
});

describe("<NumericMCUInputGroup />", () => {
  let mcuInputBoxSpy: jest.SpyInstance;

  const fakeProps = (
    mcuParams = cloneDeep(bot.hardware.mcu_params),
  ): NumericMCUInputGroupProps => ({
    sourceFwConfig: x => ({ value: mcuParams[x], consistent: true }),
    firmwareHardware: undefined,
    dispatch: jest.fn(),
    tooltip: "tip",
    label: DeviceSetting.motors,
    x: "encoder_enabled_x",
    y: "encoder_enabled_y",
    z: "encoder_enabled_z",
  });

  beforeEach(() => {
    mcuInputBoxMock.mockClear();
    mcuInputBoxSpy = jest.spyOn(mcuInputBoxModule, "McuInputBox")
      .mockImplementation((props: unknown) => mcuInputBoxMock(props as never));
  });

  afterEach(() => {
    mcuInputBoxSpy.mockRestore();
  });

  it("renders", () => {
    const { container } = render(<NumericMCUInputGroup {...fakeProps()} />);
    expect(container.textContent).toContain(DeviceSetting.motors);
    expect(container.querySelectorAll(".error").length).toEqual(0);
  });

  it("overrides advanced hide", () => {
    const mcuParams = cloneDeep(bot.hardware.mcu_params);
    mcuParams.encoder_enabled_x = 1;
    mcuParams.encoder_enabled_y = 1;
    mcuParams.encoder_enabled_z = 0;
    const p = fakeProps(mcuParams);
    p.advanced = true;
    p.showAdvanced = false;
    const { container } = render(<NumericMCUInputGroup {...p} />);
    expect(container.querySelector(".setting")?.hasAttribute("hidden"))
      .toEqual(false);
  });

  it("overrides advanced hide: scaling function", () => {
    const mcuParams = cloneDeep(bot.hardware.mcu_params);
    mcuParams.encoder_enabled_x = 0;
    mcuParams.encoder_enabled_y = 1;
    mcuParams.encoder_enabled_z = undefined;
    const p = fakeProps(mcuParams);
    p.advanced = true;
    p.showAdvanced = false;
    p.toInput = v => v;
    const { container } = render(<NumericMCUInputGroup {...p} />);
    expect(container.querySelector(".setting")?.hasAttribute("hidden"))
      .toEqual(false);
  });

  it("shows limit warnings", () => {
    const mcuInputBoxSpy = jest.spyOn(mcuInputBoxModule, "McuInputBox")
      .mockImplementation(() => <div />);
    const mcuParams = cloneDeep(bot.hardware.mcu_params);
    mcuParams.encoder_enabled_x = 1;
    mcuParams.encoder_enabled_y = 1;
    mcuParams.encoder_enabled_z = 0;
    const p = fakeProps(mcuParams);
    p.warnMin = { x: 2, y: 2, z: 0 };
    render(<NumericMCUInputGroup {...p} />);
    const calls = mcuInputBoxSpy.mock.calls
      .map(([props]) => props as { warnMin?: number });
    expect(calls.filter(props => props.warnMin == 2).length).toEqual(2);
    mcuInputBoxSpy.mockRestore();
  });

  it("shows other warnings", () => {
    const mcuInputBoxSpy = jest.spyOn(mcuInputBoxModule, "McuInputBox")
      .mockImplementation(() => <div />);
    const mcuParams = cloneDeep(bot.hardware.mcu_params);
    mcuParams.encoder_enabled_x = 1;
    mcuParams.encoder_enabled_y = 1;
    mcuParams.encoder_enabled_z = 1;
    const p = fakeProps(mcuParams);
    p.advanced = true;
    p.showAdvanced = false;
    p.warning = { x: undefined, y: undefined, z: "error" };
    render(<NumericMCUInputGroup {...p} />);
    const calls = mcuInputBoxSpy.mock.calls
      .map(([props]) => props as { warning?: string });
    expect(calls.filter(props => props.warning == "error").length).toEqual(1);
    mcuInputBoxSpy.mockRestore();
  });

  it("handles undefined values", () => {
    const p = fakeProps();
    p.x = "movement_step_per_mm_x";
    p.sourceFwConfig = () => ({ value: undefined, consistent: true });
    p.xScale = undefined;
    p.advanced = true;
    p.showAdvanced = false;
    const { container } = render(<NumericMCUInputGroup {...p} />);
    expect(container.querySelector(".setting")?.hasAttribute("hidden"))
      .toEqual(false);
  });
});
