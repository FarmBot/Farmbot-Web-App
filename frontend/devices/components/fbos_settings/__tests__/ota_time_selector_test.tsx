import React from "react";
import { OtaTimeSelector, changeOtaHour, assertIsHour } from "../ota_time_selector";
import { shallow } from "enzyme";
import { FBSelect } from "../../../../ui";
import { fakeDevice } from "../../../../__test_support__/resource_index_builder";

describe("OTA time selector", () => {
  it("asserts that a variable is an HOUR", () => {
    expect(assertIsHour(undefined)).toBe(undefined);
    // tslint:disable-next-line:no-null-keyword
    expect(assertIsHour(null as unknown as undefined)).toBe(undefined);
    const crashOn = (x: number) => () => assertIsHour(x);
    expect(assertIsHour(undefined)).toBe(undefined);
    expect(crashOn(-2)).toThrowError("Not an hour!");
    expect(crashOn(24)).toThrowError("Not an hour!");
  });
  it("selects an OTA update time", () => {
    const onUpdate = jest.fn();
    const el = shallow(<OtaTimeSelector
      timeFormat={"12h"}
      disabled={false}
      onChange={onUpdate}
      value={3} />);
    el.find(FBSelect).simulate("change", { label: "at 5 PM", value: 17 });
    expect(onUpdate).toHaveBeenCalledWith(17);
  });

  it("unselects an OTA update time", () => {
    const onUpdate = jest.fn();
    const el = shallow(<OtaTimeSelector
      timeFormat={"12h"}
      disabled={false}
      onChange={onUpdate}
      value={3} />);
    el.find(FBSelect).simulate("change", { label: "no", value: -1 });
    // tslint:disable-next-line:no-null-keyword
    expect(onUpdate).toHaveBeenCalledWith(null);
  });

  it("changes the OTA hour", () => {
    const device = fakeDevice();
    const dispatch = jest.fn();
    const fn = changeOtaHour(dispatch, device);
    fn(3);
    expect(dispatch).toHaveBeenCalledWith({
      "payload": {
        "specialStatus": "DIRTY",
        "update": {
          "ota_hour": 3,
        },
        "uuid": device.uuid,
      },
      "type": "EDIT_RESOURCE",
    });
  });
});
