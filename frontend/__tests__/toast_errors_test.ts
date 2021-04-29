import { error } from "../toast/toast";
import { toastErrors } from "../toast_errors";

describe("toastErrors()", () => {
  it("displays errors", () => {
    toastErrors({ err: { response: { data: "error" } } });
    expect(error).toHaveBeenCalledWith("Error: error");
  });
});
