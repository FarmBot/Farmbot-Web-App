import * as React from "react";
import { MotorsProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Motors, StepsPerMmSettings } from "../hardware_settings/motors";
import { render, shallow } from "enzyme";

describe("<Motors/>", () => {
  it("renders the base case", () => {
    const props: MotorsProps = { dispatch: jest.fn(), bot };
    const el = render(<Motors {...props} />);
    const txt = el.text();
    [ // Not a whole lot to test here....
      "Enable 2nd X Motor",
      "Max Retries",
      "E-Stop on Movement Error",
      "Max Speed (steps/s)"
    ].map(xpectd => expect(txt).toContain(xpectd));
  });

  it("doesn't render homing speed", () => {
    const props: MotorsProps = { dispatch: jest.fn(), bot };
    props.bot.hardware.informational_settings.firmware_version = "4.0.0R";
    const wrapper = render(<Motors {...props} />);
    expect(wrapper.text()).not.toContain("Homing Speed");
  });

  it("renders homing speed", () => {
    const props: MotorsProps = { dispatch: jest.fn(), bot };
    props.bot.hardware.informational_settings.firmware_version = "5.1.0R";
    const wrapper = render(<Motors {...props} />);
    expect(wrapper.text()).toContain("Homing Speed");
  });
});

describe("<StepsPerMmSettings/>", () => {
  it("renders OS settings", () => {
    const props: MotorsProps = { dispatch: jest.fn(), bot };
    props.bot.hardware.informational_settings.firmware_version = "4.0.0R";
    const wrapper = shallow(<StepsPerMmSettings {...props} />);
    const firstInputProps = wrapper.find("BotConfigInputBox")
      // tslint:disable-next-line:no-any
      .first().props() as any;
    expect(firstInputProps.setting).toBe("steps_per_mm_x");
  });

  it("renders mcu settings", () => {
    const props: MotorsProps = { dispatch: jest.fn(), bot };
    props.bot.hardware.informational_settings.firmware_version = "5.0.5R";
    const wrapper = shallow(<StepsPerMmSettings {...props} />);
    const firstInputProps = wrapper.find("NumericMCUInputGroup")
      .first().props();
    expect(firstInputProps.x).toBe("movement_step_per_mm_x");
  });
});
