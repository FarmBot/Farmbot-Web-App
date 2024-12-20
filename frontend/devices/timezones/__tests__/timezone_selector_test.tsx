import React from "react";
import { mount } from "enzyme";
import { TimezoneSelector } from "../timezone_selector";
import { inferTimezone } from "../guess_timezone";

describe("<TimezoneSelector/>", () => {
  const fakeProps = (): TimezoneSelector["props"] => ({
    currentTimezone: undefined,
    onUpdate: jest.fn(),
  });

  it("handles a dropdown selection", () => {
    const p = fakeProps();
    const instance = new TimezoneSelector(p);
    const ddi = { value: "UTC", label: "_" };
    instance.itemSelected(ddi);
    expect(p.onUpdate).toHaveBeenCalledWith(ddi.value);
  });

  it("triggers life cycle callbacks", () => {
    const p = fakeProps();
    const el = mount(<TimezoneSelector {...p} />);
    el.mount();
    expect(p.onUpdate).toHaveBeenCalledWith(inferTimezone(undefined));
  });
});
