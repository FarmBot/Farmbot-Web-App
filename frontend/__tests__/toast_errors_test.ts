import { toastErrors } from "../toast_errors";

describe("toastErrors()", () => {
  it("handles API errors without throwing", () => {
    expect(() => toastErrors({ err: { response: { data: "error" } } }))
      .not.toThrow();
  });
});
