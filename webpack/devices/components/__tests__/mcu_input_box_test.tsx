jest.mock("../../actions", () => ({ updateMCU: jest.fn() }));

import * as React from "react";
import { McuInputBox } from "../mcu_input_box";
import { warning } from "farmbot-toastr";
import { shallow } from "enzyme";
import { McuInputBoxProps } from "../../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { updateMCU } from "../../actions";

describe("McuInputBox", () => {
  const fakeProps = (): McuInputBoxProps => {
    return {
      sourceFwConfig: (x) => {
        return { value: bot.hardware.mcu_params[x], consistent: true };
      },
      setting: "encoder_enabled_x",
      dispatch: jest.fn()
    };
  };

  it("clamps negative numbers", () => {
    const mib = new McuInputBox(fakeProps());
    const result = mib.clampInputAndWarn("-1", "short");
    expect(result).toEqual(0);
    expect(warning)
      .toHaveBeenCalledWith("Must be a positive number. Rounding up to 0.");
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
      .toThrowError("Bad input in mcu_input_box. Impossible?");
    expect(warning)
      .toHaveBeenCalledWith("Please enter a number between 0 and 32,000");
  });

  it("handles float", () => {
    const p = fakeProps();
    p.float = true;
    const wrapper = shallow(<McuInputBox {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "5.5" } });
    expect(updateMCU).toHaveBeenCalledWith("encoder_enabled_x", "5.5");
  });

  it("handles int", () => {
    const p = fakeProps();
    p.float = false;
    const wrapper = shallow(<McuInputBox {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "5.5" } });
    expect(updateMCU).toHaveBeenCalledWith("encoder_enabled_x", "5");
  });
});
