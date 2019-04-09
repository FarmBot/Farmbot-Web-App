import * as React from "react";
import { mount } from "enzyme";
import { TimezoneSelector } from "../timezone_selector";
import { inferTimezone } from "../guess_timezone";

describe("<TimezoneSelector/>", () => {
  it("handles a dropdown selection", () => {
    const props: TimezoneSelector["props"] =
      { currentTimezone: undefined, onUpdate: jest.fn() };
    const instance = new TimezoneSelector(props);
    const ddi = { value: "UTC", label: "_" };
    instance.itemSelected(ddi);
    expect(props.onUpdate).toHaveBeenCalledWith(ddi.value);
  });

  it("triggers lifecycle callbacks", () => {
    const props: TimezoneSelector["props"] =
      { currentTimezone: undefined, onUpdate: jest.fn() };
    const el = mount<TimezoneSelector>(<TimezoneSelector {...props} />);
    el.simulate("change");
    // componentWillMount() triggers timezone inference:
    expect(props.onUpdate).toHaveBeenCalledWith(inferTimezone(undefined));
  });
});
