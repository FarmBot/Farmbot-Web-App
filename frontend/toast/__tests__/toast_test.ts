import {
  warning,
  error,
  success,
  info,
  fun,
  removeToast,
  busy,
} from "../toast";

describe("toasts", () => {
  it("exports mocked toast helpers in the test environment", () => {
    [warning, error, success, info, fun, removeToast, busy].map(fn =>
      expect(jest.isMockFunction(fn)).toBeTruthy());
  });

  it("records helper calls", () => {
    const options = { title: "title", color: "blue" };
    warning("warning", options);
    error("error", options);
    success("success", options);
    info("info", options);
    fun("fun", options);
    busy("busy", options);
    removeToast("id-prefix");

    expect(warning).toHaveBeenCalledWith("warning", options);
    expect(error).toHaveBeenCalledWith("error", options);
    expect(success).toHaveBeenCalledWith("success", options);
    expect(info).toHaveBeenCalledWith("info", options);
    expect(fun).toHaveBeenCalledWith("fun", options);
    expect(busy).toHaveBeenCalledWith("busy", options);
    expect(removeToast).toHaveBeenCalledWith("id-prefix");
  });
});
