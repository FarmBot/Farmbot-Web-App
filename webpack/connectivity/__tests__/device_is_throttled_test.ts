import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { deviceIsThrottled } from "../device_is_throttled";

describe("deviceIsThrottled", () => {
  it("returns true when throttled_at and throttled_until are set", () => {
    const dev = fakeDevice();
    dev.body.throttled_until = "whatever";
    dev.body.throttled_at = "whatever";
    expect(deviceIsThrottled(dev.body)).toBeTruthy();
  });

  it("returns false for unthrottled devices", () => {
    expect(deviceIsThrottled(fakeDevice().body)).toBeFalsy();
  });

  it("returns false for undefined", () => {
    expect(deviceIsThrottled(undefined)).toBeFalsy();
  });
});
