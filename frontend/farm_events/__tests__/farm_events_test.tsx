import React from "react";
import { shallow, mount } from "enzyme";
import { RawFarmEvents as FarmEvents } from "../farm_events";
import {
  calendarRows,
} from "../../__test_support__/farm_event_calendar_support";
import { defensiveClone } from "../../util";
import { FarmEventProps } from "../../farm_designer/interfaces";
import { Path } from "../../internal_urls";

describe("<FarmEvents />", () => {
  const fakeProps = (): FarmEventProps => ({
    timezoneIsSet: true,
    calendarRows,
  });

  it("sorts items correctly", () => {
    const wrapper = mount(<FarmEvents {...fakeProps()} />);
    const times = wrapper.find(".farm-event-data-time").map(x => x.text());
    expect(times).not.toContain("");
    expect(times.length).toEqual(21);
    expect(times[0]).toEqual("12:05pm");
    expect(times[2]).toEqual("02:00pm");
  });

  it("renders sequence FarmEvent lacking a subheading", () => {
    const p = fakeProps();
    const row = [defensiveClone(calendarRows[0])];
    row[0].items = [{
      mmddyy: "072417",
      sortKey: 1500915900,
      timeStr: "12:05pm",
      heading: "Every 4 hours",
      executableId: 25,
      executableType: "Sequence",
      subheading: "",
      variables: ["variable 1", "variable 2"],
      id: 79,
      color: "gray",
    }];
    p.calendarRows = row;
    const wrapper = mount(<FarmEvents {...p} />);
    expect(wrapper.text()).toContain("Every 4 hours");
    const item = wrapper.find(".farm-event-data-block");
    expect(item.hasClass("gray")).toBeTruthy();
    expect(item.find(".farm-event-variable").length).toEqual(2);
    expect(item.find("a").first().props().href)
      .toEqual(Path.sequences("Every_4_hours"));
  });

  it("renders regimen FarmEvent lacking a subheading", () => {
    const p = fakeProps();
    const row = [defensiveClone(calendarRows[0])];
    row[0].items = [{
      mmddyy: "072417",
      sortKey: 1500915900,
      timeStr: "12:05pm",
      heading: "Every 4 hours",
      executableId: 25,
      executableType: "Regimen",
      subheading: "",
      variables: ["variable 1", "variable 2"],
      id: 79,
      color: "gray",
    }];
    p.calendarRows = row;
    const wrapper = mount(<FarmEvents {...p} />);
    expect(wrapper.text()).toContain("Every 4 hours");
    const item = wrapper.find(".farm-event-data-block");
    expect(item.hasClass("gray")).toBeTruthy();
    expect(item.find(".farm-event-variable").length).toEqual(2);
    expect(item.find("a").first().props().href)
      .toEqual(Path.regimens("Every_4_hours"));
  });

  it("filters farm events: finds none", () => {
    const wrapper = mount(<FarmEvents {...fakeProps()} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "no match" } });
    expect(wrapper.text()).not.toContain("every 4 hours");
  });

  it("filters farm events: finds some", () => {
    const wrapper = mount(<FarmEvents {...fakeProps()} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "every 4 hours" } });
    expect(wrapper.text().toLowerCase()).toContain("every 4 hours");
  });

  it("resets calendar", () => {
    const mockScrollTo = jest.fn();
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollTo: mockScrollTo }), configurable: true
    });
    const wrapper = shallow(<FarmEvents {...fakeProps()} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = wrapper.instance() as any;
    instance.setState({ searchTerm: "farm events" });
    instance.resetCalendar();
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(instance.state.searchTerm).toEqual("");
  });

  it("can't find panel", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => { }, configurable: true
    });
    const wrapper = shallow(<FarmEvents {...fakeProps()} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = wrapper.instance() as any;
    instance.setState({ searchTerm: "farm events" });
    instance.resetCalendar();
    expect(instance.state.searchTerm).toEqual("");
  });

  it("has add new farm event link", () => {
    const wrapper = mount(<FarmEvents {...fakeProps()} />);
    expect(wrapper.html()).toContain("fa-plus");
    expect(wrapper.html()).toContain(Path.farmEvents("add"));
  });
});
