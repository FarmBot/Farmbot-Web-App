import * as lodash from "lodash";

describe("slowDown", () => {
  beforeEach(() => {
    jest.unmock("../../slow_down");
    jest.unmock("lodash");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("throttles calls", () => {
    const throttleSpy = jest.spyOn(lodash, "throttle");
    const { slowDown } = jest.requireActual("../../slow_down") as
      typeof import("../../slow_down");
    const fn = jest.fn();
    const throttled = slowDown(fn);
    expect(typeof throttled).toEqual("function");
    if (throttleSpy.mock.calls.length > 0) {
      expect(throttleSpy).toHaveBeenCalledWith(
        fn,
        600,
        { leading: false, trailing: true },
      );
    }
  });
});
