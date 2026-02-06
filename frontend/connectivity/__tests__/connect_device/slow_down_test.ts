import { slowDown } from "../../slow_down";
import * as lodash from "lodash";

describe("slowDown", () => {
  let throttleSpy: jest.SpyInstance;

  beforeEach(() => {
    throttleSpy = jest.spyOn(lodash, "throttle").mockImplementation(jest.fn());
  });

  afterEach(() => {
    throttleSpy.mockRestore();
  });

  it("throttles a function", () => {
    const fn = jest.fn();
    slowDown(fn);
    expect(throttleSpy)
      .toHaveBeenCalledWith(fn, 600, { leading: false, trailing: true });
  });
});
