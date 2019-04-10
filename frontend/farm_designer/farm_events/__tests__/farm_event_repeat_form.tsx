import * as React from "react";
import { RepeatFormProps, FarmEventRepeatForm } from "../farm_event_repeat_form";
import { betterMerge } from "../../../util";
import { shallow, ShallowWrapper, render } from "enzyme";
import { get } from "lodash";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

const DEFAULTS: RepeatFormProps = {
  disabled: false,
  hidden: false,
  onChange: jest.fn(),
  timeUnit: "daily",
  repeat: "1",
  endDate: "2017-07-26",
  endTime: "08:57",
  timeSettings: fakeTimeSettings(),
};

enum Selectors {
  REPEAT = "BlurableInput[name=\"repeat\"]",
  END_DATE = "BlurableInput[name=\"endDate\"]",
  END_TIME = "EventTimePicker[name=\"endTime\"]",
  TIME_UNIT = "FBSelect"
}

function props(i?: Partial<RepeatFormProps>): RepeatFormProps {
  return betterMerge(DEFAULTS, i || {});
}

function formVal(el: ShallowWrapper<{}, {}>, query: string) {
  return getProp(el, query, "value");
}

function getProp(el: ShallowWrapper<{}, {}>, query: string, prop: string) {
  return get(el.find(query).props(), prop, "NOT_FOUND");
}

describe("<FarmEventRepeatForm/>", () => {
  it("shows proper values", () => {
    const p = props();
    const el = shallow<RepeatFormProps>(<FarmEventRepeatForm {...p} />);
    expect(formVal(el, Selectors.REPEAT)).toEqual(p.repeat);
    expect(formVal(el, Selectors.END_DATE)).toEqual(p.endDate);
    expect(formVal(el, Selectors.END_TIME)).toEqual(p.endTime);
    expect(getProp(el, Selectors.TIME_UNIT, "selectedItem.value"))
      .toEqual(p.timeUnit);
  });

  it("defaults to `daily` when a bad input it passed", () => {
    const p = props();
    p.timeUnit = "never";
    const el = shallow(<FarmEventRepeatForm {...p} />);
    expect(formVal(el, Selectors.REPEAT)).toEqual(p.repeat);
    expect(getProp(el, "FBSelect", "selectedItem.value")).toEqual("daily");
  });

  it("disables all inputs via the `disabled` prop", () => {
    const p = props();
    p.disabled = true;
    const el = shallow(<FarmEventRepeatForm {...p} />);
    expect(getProp(el, Selectors.END_DATE, "disabled")).toBeTruthy();
    expect(getProp(el, Selectors.END_TIME, "disabled")).toBeTruthy();
    expect(getProp(el, Selectors.REPEAT, "disabled")).toBeTruthy();
    expect(getProp(el, Selectors.TIME_UNIT, "disabled")).toBeTruthy();
  });

  it("hides", () => {
    const p = props();
    p.hidden = true;
    const el = render(<FarmEventRepeatForm {...p} />);
    expect(el.text()).toEqual("");
  });
});
