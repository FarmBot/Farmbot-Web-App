import * as React from "react";
import { PureFarmEvents } from "../farm_events";
import {
  calendarRows
} from "../../../__test_support__/farm_event_calendar_support";
import { render, shallow, mount } from "enzyme";
import { get } from "lodash";
import { Content } from "../../../constants";
import { defensiveClone } from "../../../util";

describe("<PureFarmEvents/>", () => {
  it("renders nav", () => {
    const wrapper = render(<PureFarmEvents
      calendarRows={calendarRows}
      timezoneIsSet={false} />);
    ["Map", "Plants", "Events"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("sorts items correctly", () => {
    const results = render(<PureFarmEvents
      calendarRows={calendarRows}
      timezoneIsSet={true} />);
    const rows = results
      .find(".farm-event-data-time")
      .toArray()
      .map(x => x.children)
      .map(x => x[0])
      .map(x => get(x, "data", "NOT_FOUND"));
    expect(rows).not.toContain("NOT_FOUND");
    expect(rows.length).toEqual(21);
    expect(rows[0]).toEqual("12:05pm");
    expect(rows[2]).toEqual("02:00pm");
  });

  it("warns about unset timezones", () => {
    const results = render(<PureFarmEvents
      calendarRows={calendarRows}
      timezoneIsSet={false} />);
    const txt = results.text();
    expect(txt).toContain(Content.SET_TIMEZONE_HEADER);
    expect(txt).toContain(Content.SET_TIMEZONE_BODY);
  });

  it("renders FarmEvent lacking a subheading", () => {
    const row = [defensiveClone(calendarRows[0])];
    row[0].items = [{
      mmddyy: "072417",
      sortKey: 1500915900,
      timeStr: "12:05pm",
      heading: "Every 4 hours",
      executableId: 25,
      subheading: "",
      id: 79
    }];
    const results = render(<PureFarmEvents
      calendarRows={row}
      timezoneIsSet={true} />);
    const txt = results.text();
    expect(txt).toContain("Every 4 hours");
  });

  it("filters farm events: finds none", () => {
    const wrapper = mount(<PureFarmEvents
      calendarRows={calendarRows}
      timezoneIsSet={true} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "no match" } });
    expect(wrapper.text()).not.toContain("every 4 hours");
  });

  it("filters farm events: finds some", () => {
    const wrapper = mount(<PureFarmEvents
      calendarRows={calendarRows}
      timezoneIsSet={true} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "every 4 hours" } });
    expect(wrapper.text().toLowerCase()).toContain("every 4 hours");
  });

  it("resets calendar", () => {
    const mockScrollTo = jest.fn();
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollTo: mockScrollTo }), configurable: true
    });
    const wrapper = shallow(<PureFarmEvents
      calendarRows={calendarRows}
      timezoneIsSet={true} />);
    // tslint:disable-next-line:no-any
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
    const wrapper = shallow(<PureFarmEvents
      calendarRows={calendarRows}
      timezoneIsSet={true} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.setState({ searchTerm: "farm events" });
    instance.resetCalendar();
    expect(instance.state.searchTerm).toEqual("");
  });
});
