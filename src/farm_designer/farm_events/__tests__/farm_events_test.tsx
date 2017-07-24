import * as React from "react";
import { PureFarmEvents, stringToMinutes } from "../farm_events";
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

  fit("parses a time string into minutes", () => {
    let items = calendarRows[0].items;
    expect(stringToMinutes(items[0].timeStr)).toEqual(840);
    expect(stringToMinutes(items[1].timeStr)).toEqual(1445);
    expect(stringToMinutes(items[2].timeStr)).toEqual(965);
    expect(stringToMinutes(items[3].timeStr)).toEqual(840);
  });
});
