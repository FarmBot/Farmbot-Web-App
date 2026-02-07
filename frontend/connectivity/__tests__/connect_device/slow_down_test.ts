import { slowDown } from "../../slow_down";

describe("slowDown", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("throttles a function", () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const throttled = slowDown(fn);
    throttled(undefined);
    throttled(undefined);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(600);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
