import * as React from "react";
import { PureFarmEvents } from "../farm_events";
import {
  calendarRows
} from "../../../__test_support__/farm_event_calendar_support";
import { render } from "enzyme";
import { get } from "lodash";
import { Content } from "../../../constants";
import { defensiveClone } from "../../../util";

describe("<PureFarmEvents/>", () => {
  it("renders nav", () => {
    const wrapper = render(<PureFarmEvents push={jest.fn()}
      calendarRows={calendarRows}
      timezoneIsSet={false} />);
    ["Map", "Plants", "Farm Events"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("sorts items correctly", () => {
    const push = jest.fn();
    const results = render(<PureFarmEvents push={push}
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
    const results = render(<PureFarmEvents push={jest.fn()}
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
    const results = render(<PureFarmEvents push={jest.fn()}
      calendarRows={row}
      timezoneIsSet={true} />);
    const txt = results.text();
    expect(txt).toContain("Every 4 hours");
  });
});
