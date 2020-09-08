import React from "react";
import {
  OtaTimeSelector, changeOtaHour, assertIsHour, OtaTimeSelectorRow,
  OtaTimeSelectorProps,
  ASAP,
} from "../ota_time_selector";
import { shallow, mount } from "enzyme";
import { FBSelect } from "../../../ui";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { OtaTimeSelectorRowProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("assertIsHour()", () => {
  it("asserts that a variable is an HOUR", () => {
    expect(assertIsHour(undefined)).toBe(undefined);
    // eslint-disable-next-line no-null/no-null
    expect(assertIsHour(null as unknown as undefined)).toBe(undefined);
    const crashOn = (x: number) => () => assertIsHour(x);
    expect(assertIsHour(undefined)).toBe(undefined);
    expect(crashOn(-2)).toThrowError("Not an hour!");
    expect(crashOn(24)).toThrowError("Not an hour!");
  });
});

describe("<OtaTimeSelector />", () => {
  const fakeProps = (): OtaTimeSelectorProps => ({
    timeFormat: "12h",
    disabled: false,
    onChange: jest.fn(),
    value: 3,
  });

  it("selects an OTA update time", () => {
    const p = fakeProps();
    const el = shallow(<OtaTimeSelector {...p} />);
    el.find(FBSelect).simulate("change", { label: "at 5 PM", value: 17 });
    expect(p.onChange).toHaveBeenCalledWith(17);
  });

  it("unselects an OTA update time", () => {
    const p = fakeProps();
    const el = shallow(<OtaTimeSelector {...p} />);
    el.find(FBSelect).simulate("change", { label: "no", value: -1 });
    // eslint-disable-next-line no-null/no-null
    expect(p.onChange).toHaveBeenCalledWith(null);
  });

  it("select a default value", () => {
    const p = fakeProps();
    p.value = undefined;
    const el = shallow(<OtaTimeSelector {...p} />);
    expect(el.find(FBSelect).props().selectedItem).toEqual({
      label: ASAP(), value: -1
    });
  });
});

describe("changeOtaHour()", () => {
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

describe("<OtaTimeSelectorRow />", () => {
  const fakeProps = (): OtaTimeSelectorRowProps => ({
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: "", consistent: true }),
    device: fakeDevice(),
    timeSettings: fakeTimeSettings(),
  });

  it("shows 12h formatted times", () => {
    const p = fakeProps();
    p.timeSettings.hour24 = false;
    const wrapper = mount(<OtaTimeSelectorRow {...p} />);
    expect(wrapper.find(FBSelect).props().list)
      .toContainEqual({ label: "8:00 PM", value: 20 });
  });

  it("shows 24h formatted times", () => {
    const p = fakeProps();
    p.timeSettings.hour24 = true;
    const wrapper = mount(<OtaTimeSelectorRow {...p} />);
    expect(wrapper.find(FBSelect).props().list)
      .toContainEqual({ label: "20:00", value: 20 });
  });
});
