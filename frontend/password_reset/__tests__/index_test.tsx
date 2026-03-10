import * as util from "../../util";
import { PasswordReset } from "../password_reset";

describe("PasswordReset loader", () => {

  it("calls entryPoint", async () => {
    const entryPointSpy = jest.spyOn(util, "entryPoint")
      .mockImplementation(jest.fn());
    const { initPasswordReset } = await import("../index");
    initPasswordReset();
    expect(entryPointSpy).toHaveBeenCalledWith(PasswordReset);
  });
});
