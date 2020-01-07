import * as React from "react";
import {
  FarmEventRepeatFormProps, FarmEventRepeatForm
} from "../farm_event_repeat_form";
import { shallow, ShallowWrapper, render } from "enzyme";
import { get } from "lodash";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

const fakeProps = (): FarmEventRepeatFormProps => ({
  disabled: false,
  hidden: false,
  fieldSet: jest.fn(),
  timeUnit: "daily",
  repeat: "1",
  endDate: "2017-07-26",
  endTime: "08:57",
  timeSettings: fakeTimeSettings(),
});

enum Selectors {
  REPEAT = "BlurableInput[name=\"repeat\"]",
  END_DATE = "BlurableInput[name=\"endDate\"]",
  END_TIME = "EventTimePicker[name=\"endTime\"]",
  TIME_UNIT = "FBSelect"
}

function formVal(el: ShallowWrapper<{}, {}>, query: string) {
  return getProp(el, query, "value");
}

function getProp(el: ShallowWrapper<{}, {}>, query: string, prop: string) {
  return get(el.find(query).props(), prop, "NOT_FOUND");
}

describe("<FarmEventRepeatForm/>", () => {
  it("shows proper values", () => {
    const p = fakeProps();
    const el = shallow<FarmEventRepeatFormProps>(<FarmEventRepeatForm {...p} />);
    expect(formVal(el, Selectors.REPEAT)).toEqual(p.repeat);
    expect(formVal(el, Selectors.END_DATE)).toEqual(p.endDate);
    expect(formVal(el, Selectors.END_TIME)).toEqual(p.endTime);
    expect(getProp(el, Selectors.TIME_UNIT, "selectedItem.value"))
      .toEqual(p.timeUnit);
  });

  it("defaults to `daily` when a bad input it passed", () => {
    const p = fakeProps();
    p.timeUnit = "never";
    const el = shallow(<FarmEventRepeatForm {...p} />);
    expect(formVal(el, Selectors.REPEAT)).toEqual(p.repeat);
    expect(getProp(el, "FBSelect", "selectedItem.value")).toEqual("daily");
  });

  it("disables all inputs via the `disabled` prop", () => {
    const p = fakeProps();
    p.disabled = true;
    const el = shallow(<FarmEventRepeatForm {...p} />);
    expect(getProp(el, Selectors.END_DATE, "disabled")).toBeTruthy();
    expect(getProp(el, Selectors.END_TIME, "disabled")).toBeTruthy();
    expect(getProp(el, Selectors.REPEAT, "disabled")).toBeTruthy();
    expect(getProp(el, Selectors.TIME_UNIT, "disabled")).toBeTruthy();
  });

  it("hides", () => {
    const p = fakeProps();
    p.hidden = true;
    const el = render(<FarmEventRepeatForm {...p} />);
    expect(el.text()).toEqual("");
  });

  const testBlurable = (input: string, field: string, value: string) => {
    const p = fakeProps();
    const wrapper = shallow(<FarmEventRepeatForm {...p} />);
    wrapper.find(input).simulate("commit", {
      currentTarget: { value }
    });
    expect(p.fieldSet).toHaveBeenCalledWith(field, value);
  };

  it("changes repeat frequency", () => {
    testBlurable(Selectors.REPEAT, "repeat", "1");
  });

  it("changes time unit", () => {
    const p = fakeProps();
    const wrapper = shallow(<FarmEventRepeatForm {...p} />);
    wrapper.find(Selectors.TIME_UNIT).simulate("change", { value: "daily" });
    expect(p.fieldSet).toHaveBeenCalledWith("timeUnit", "daily");
  });

  it("changes end date", () => {
    testBlurable(Selectors.END_DATE, "endDate", "2017-07-26");
  });

  it("changes end time", () => {
    testBlurable(Selectors.END_TIME, "endTime", "08:57");
  });
});
