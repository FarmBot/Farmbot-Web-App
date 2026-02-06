import React from "react";
import { mount } from "enzyme";
import { TimezoneSelector } from "../timezone_selector";
import * as guessTimezone from "../guess_timezone";

describe("<TimezoneSelector/>", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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
    jest.spyOn(guessTimezone, "inferTimezone").mockReturnValue("UTC");
    const p = fakeProps();
    const el = mount(<TimezoneSelector {...p} />);
    el.mount();
    expect(p.onUpdate).toHaveBeenCalledWith("UTC");
  });
});
