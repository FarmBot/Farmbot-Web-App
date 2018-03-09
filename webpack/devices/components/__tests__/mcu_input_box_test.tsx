jest.mock("farmbot-toastr", () => ({ warning: jest.fn() }));

import { McuInputBox } from "../mcu_input_box";
import { warning } from "farmbot-toastr";

describe("McuInputBox", () => {
  it("clamps numbers", () => {
    jest.clearAllMocks();
    const mib = new McuInputBox({
      sourceFwConfig: jest.fn(),
      setting: "encoder_enabled_x",
      dispatch: jest.fn()
    });
    const result = mib.clampInputAndWarn("-1", "short");
    expect(result).toEqual(0);
    expect(warning)
      .toHaveBeenCalledWith("Must be a positive number. Rounding up to 0.");
    jest.clearAllMocks();
    expect(() => mib.clampInputAndWarn("QQQ", "short"))
      .toThrowError("Bad input in mcu_input_box. Impossible?");
    expect(warning)
      .toHaveBeenCalledWith("Please enter a number between 0 and 32,000");
  });
});
