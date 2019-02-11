jest.mock("lodash",
  () => ({ throttle: jest.fn() }));
import { slowDown } from "../../slow_down";
import { throttle } from "lodash";

describe("slowDown", () => {
  it("throttles a function", () => {
    const fn = jest.fn();
    slowDown(fn);
    expect(throttle)
      .toHaveBeenCalledWith(fn, 600, { leading: false, trailing: true });
  });
});
