import { Calendar } from "../index";
import * as moment from "moment";
import { occurrence } from "../occurrence";
import {
  TIME,
  fakeFarmEventWithExecutable
} from "../../../../__test_support__/farm_event_calendar_support";

describe("calendar", () => {
  it("constructs itself with defaults", () => {
    let calendar = new Calendar();
    expect(calendar.getAll().length).toEqual(0);
    expect(calendar.value).toEqual({});
  });

  it("inserts dates", () => {
    let calendar = new Calendar();
    calendar.insert(occurrence(TIME.MONDAY, fakeFarmEventWithExecutable()));
    calendar.insert(occurrence(TIME.TUESDAY, fakeFarmEventWithExecutable()));
    expect(calendar.getAll().length).toEqual(2);
    expect(calendar.value).toBeInstanceOf(Object);
    expect(calendar.value["0619"]).toBeInstanceOf(Array);
    expect(calendar.value["0620"]).toBeInstanceOf(Array);
  });

  it("finds by date", () => {
    let calendar = new Calendar();
    let wow = occurrence(TIME.MONDAY, fakeFarmEventWithExecutable());
    calendar.insert(wow);
    expect(calendar.findByDate(TIME.FRIDAY)).toBeInstanceOf(Array);
    expect(calendar.findByDate(TIME.MONDAY)).toContain(wow);
  });
  it("sorts CalendarDay");
  it("formats a date");
});
