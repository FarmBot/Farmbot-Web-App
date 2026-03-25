import React from "react";
import { McuInputBox } from "../mcu_input_box";
import { render, screen } from "@testing-library/react";
import { McuInputBoxProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import * as deviceActions from "../../../devices/actions";
import { warning } from "../../../toast/toast";
import * as ui from "../../../ui";
import * as statusIndicator from "../setting_status_indicator";
import { BIProps } from "../../../ui/blurable_input";

const settingStatusIndicatorMock = jest.fn((_: unknown) => <div />);
const blurableInputMock = jest.fn((props: BIProps) =>
  <div>
    <input
      data-testid="mcu-input"
      readOnly={true}
      value={props.value || ""}
      min={props.min}
      max={props.max} />
    {props.error && <div className="error">{props.error}</div>}
  </div>,
);

let updateMCUSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;
let settingStatusIndicatorSpy: jest.SpyInstance;

beforeEach(() => {
  blurableInputMock.mockClear();
  settingStatusIndicatorMock.mockClear();
  updateMCUSpy = jest.spyOn(deviceActions, "updateMCU")
    .mockImplementation(jest.fn());
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation(((props: BIProps) => blurableInputMock(props)) as never);
  settingStatusIndicatorSpy = jest.spyOn(statusIndicator, "SettingStatusIndicator")
    .mockImplementation((props: unknown) => settingStatusIndicatorMock(props));
});

afterEach(() => {
  updateMCUSpy.mockRestore();
  blurableInputSpy.mockRestore();
  settingStatusIndicatorSpy.mockRestore();
});

describe("McuInputBox", () => {
  const fakeProps = (): McuInputBoxProps => ({
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    setting: "encoder_enabled_x",
    dispatch: jest.fn()
  });

  it("renders inconsistency", () => {
    settingStatusIndicatorMock.mockClear();
    const p = fakeProps();
    p.sourceFwConfig = x =>
      ({ value: bot.hardware.mcu_params[x], consistent: false });
    render(<McuInputBox {...p} />);
    const props = settingStatusIndicatorMock.mock.calls[0]?.[0] as
      { isSyncing: boolean };
    expect(props.isSyncing).toBeTruthy();
  });

  it("clamps negative numbers", () => {
    const mib = new McuInputBox(fakeProps());
    const result = mib.clampInputAndWarn("-1", "short");
    expect(result).toEqual(0);
    expect(warning)
      .toHaveBeenCalledWith("Minimum input is 0. Rounding up.");
  });

  it("clamps large numbers", () => {
    const mib = new McuInputBox(fakeProps());
    const result = mib.clampInputAndWarn("100000", "short");
    expect(result).toEqual(32000);
    expect(warning)
      .toHaveBeenCalledWith("Maximum input is 32,000. Rounding down.");
  });

  it("handles bad input", () => {
    const mib = new McuInputBox(fakeProps());
    expect(() => mib.clampInputAndWarn("QQQ", "short"))
      .toThrow("Bad input in mcu_input_box. Impossible?");
    expect(warning)
      .toHaveBeenCalledWith("Please enter a number between 0 and 32,000");
  });

  it("handles float", () => {
    blurableInputMock.mockClear();
    const p = fakeProps();
    p.float = true;
    render(<McuInputBox {...p} />);
    const props = blurableInputMock.mock.calls[0]?.[0] as {
      onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => void,
    };
    props.onCommit({ currentTarget: { value: "5.5" } } as never);
    expect(updateMCUSpy).toHaveBeenCalledWith("encoder_enabled_x", "5.5");
  });

  it("handles int", () => {
    blurableInputMock.mockClear();
    const p = fakeProps();
    p.float = false;
    render(<McuInputBox {...p} />);
    const props = blurableInputMock.mock.calls[0]?.[0] as {
      onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => void,
    };
    props.onCommit({ currentTarget: { value: "5.5" } } as never);
    expect(updateMCUSpy).toHaveBeenCalledWith("encoder_enabled_x", "5");
  });

  it("scales values", () => {
    blurableInputMock.mockClear();
    const p = fakeProps();
    p.scale = 10;
    bot.hardware.mcu_params.encoder_enabled_x = 7;
    render(<McuInputBox {...p} />);
    const props = blurableInputMock.mock.calls[0]?.[0] as {
      value: string,
      onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => void,
    };
    expect(props.value).toEqual("0.7");
    props.onCommit({ currentTarget: { value: "5.5" } } as never);
    expect(updateMCUSpy).toHaveBeenCalledWith("encoder_enabled_x", "55");
  });

  it("doesn't update when values match", () => {
    blurableInputMock.mockClear();
    const p = fakeProps();
    bot.hardware.mcu_params.encoder_enabled_x = 1;
    render(<McuInputBox {...p} />);
    const props = blurableInputMock.mock.calls[0]?.[0] as {
      onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => void,
    };
    props.onCommit({ currentTarget: { value: "1" } } as never);
    expect(updateMCUSpy).not.toHaveBeenCalled();
  });

  it("doesn't update when values match after scaling function", () => {
    blurableInputMock.mockClear();
    const p = fakeProps();
    bot.hardware.mcu_params.encoder_enabled_x = 1;
    p.fromInput = () => 1;
    render(<McuInputBox {...p} />);
    const props = blurableInputMock.mock.calls[0]?.[0] as {
      onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => void,
    };
    props.onCommit({ currentTarget: { value: "0" } } as never);
    expect(updateMCUSpy).not.toHaveBeenCalled();
  });

  it("restricts values to min and max", () => {
    const p = fakeProps();
    p.min = -10;
    p.max = 10;
    const { container } = render(<McuInputBox {...p} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByTestId("mcu-input") as HTMLInputElement;
    expect(input.min).toEqual("-10");
    expect(input.max).toEqual("10");
    expect(container.querySelectorAll(".error").length).toEqual(0);
  });

  it("shows warning", () => {
    const p = fakeProps();
    p.warnMin = 10;
    bot.hardware.mcu_params.encoder_enabled_x = 7;
    const { container } = render(<McuInputBox {...p} />);
    expect(container.querySelectorAll(".error").length).toEqual(1);
  });

  it("updates status", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.sourceFwConfig = () => ({ value: 1, consistent: false });
    const mib = new McuInputBox(p);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mib.setState = ((update: any) => {
      const next = typeof update == "function" ? update(mib.state) : update;
      mib.state = { ...mib.state, ...next };
      return undefined;
    }) as never;
    mib.componentDidUpdate();
    expect(mib.state.syncing).toEqual(true);
    jest.runAllTimers();
    expect(mib.state.syncing).toEqual(false);
    mib.state = { ...mib.state, inconsistent: false };
    mib.componentDidUpdate();
    jest.useRealTimers();
  });
});
