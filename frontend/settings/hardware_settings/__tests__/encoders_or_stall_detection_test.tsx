let mockDev = false;

import React from "react";
import { render } from "@testing-library/react";
import { EncodersOrStallDetection } from "../encoders_or_stall_detection";
import { EncodersOrStallDetectionProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { bot } from "../../../__test_support__/fake_state/bot";
import * as booleanGroup from "../boolean_mcu_input_group";
import * as numericGroup from "../numeric_mcu_input_group";
import * as devSupport from "../../dev/dev_support";

const booleanGroupMock = jest.fn((props: { label: string }) => <div>{props.label}</div>);
const numericGroupMock = jest.fn((props: { label: string }) => <div>{props.label}</div>);
let booleanGroupSpy: jest.SpyInstance;
let numericGroupSpy: jest.SpyInstance;
let futureFeaturesEnabledSpy: jest.SpyInstance;

describe("<EncodersOrStallDetection />", () => {
  const fakeProps = (): EncodersOrStallDetectionProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    showAdvanced: true,
  });

  beforeEach(() => {
    booleanGroupSpy = jest.spyOn(booleanGroup, "BooleanMCUInputGroup")
      .mockImplementation((props: { label: string }) => booleanGroupMock(props));
    numericGroupSpy = jest.spyOn(numericGroup, "NumericMCUInputGroup")
      .mockImplementation((props: { label: string }) => numericGroupMock(props));
    futureFeaturesEnabledSpy =
      jest.spyOn(devSupport.DevSettings, "futureFeaturesEnabled")
        .mockImplementation(() => mockDev);
    booleanGroupMock.mockClear();
    numericGroupMock.mockClear();
  });

  afterEach(() => {
    booleanGroupSpy.mockRestore();
    numericGroupSpy.mockRestore();
    futureFeaturesEnabledSpy.mockRestore();
  });

  it("shows encoder labels", () => {
    const p = fakeProps();
    p.firmwareHardware = undefined;
    const { container } = render(<EncodersOrStallDetection {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("encoder");
    expect((container.textContent || "").toLowerCase()).not.toContain("stall");
  });

  it("shows stall labels", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container } = render(<EncodersOrStallDetection {...p} />);
    expect((container.textContent || "").toLowerCase()).not.toContain("encoder");
    expect((container.textContent || "").toLowerCase()).toContain("stall");
  });

  it("doesn't disable encoder toggles", () => {
    const p = fakeProps();
    p.settingsPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "arduino";
    render(<EncodersOrStallDetection {...p} />);
    const firstProps = booleanGroupMock.mock.calls[0]?.[0] as
      unknown as { disabled: boolean };
    expect(firstProps.disabled).toEqual(false);
  });

  it("doesn't disable stall detection toggles", () => {
    const p = fakeProps();
    p.settingsPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "express_k10";
    render(<EncodersOrStallDetection {...p} />);
    const firstProps = booleanGroupMock.mock.calls[0]?.[0] as
      unknown as { disabled: boolean };
    expect(firstProps.disabled).toEqual(false);
  });

  it("shows sensitivity setting", () => {
    mockDev = true;
    const p = fakeProps();
    p.settingsPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "express_k10";
    const { container } = render(<EncodersOrStallDetection {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("sensitivity");
  });
});
