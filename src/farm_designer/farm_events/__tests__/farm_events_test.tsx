import * as React from "react";
import { PureFarmEvents } from "../farm_events";
import {
  calendarRows
} from "../../../__test_support__/farm_event_calendar_support";
import { render } from "enzyme";
import { get } from "lodash";

describe("<PureFarmEvents/>", () => {
  it("sorts items correctly", () => {
    let push = jest.fn();
    let results = render(<PureFarmEvents push={push}
      calendarRows={calendarRows} />);
    let rows = results
      .find(".farm-event-data-time")
      .toArray()
      .map(x => x.children)
      .map(x => x[0])
      .map(x => get(x, "data", "NOT_FOUND"));
    expect(rows.length).toEqual(21);
    expect(rows[0]).toEqual("12:05pm");
    expect(rows[2]).toEqual("02:00pm");
  });
});
