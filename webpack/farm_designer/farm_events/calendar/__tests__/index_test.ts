import { Calendar } from "../index";
import { occurrence } from "../occurrence";
import {
  TIME,
  fakeFarmEventWithExecutable
} from "../../../../__test_support__/farm_event_calendar_support";

describe("calendar", () => {
  it("constructs itself with defaults", () => {
    const calendar = new Calendar();
    expect(calendar.getAll().length).toEqual(0);
    expect(calendar.value).toEqual({});
  });

  it("inserts dates", () => {
    const calendar = new Calendar();
    calendar.insert(occurrence(TIME.MONDAY, fakeFarmEventWithExecutable(), 0));
    calendar.insert(occurrence(TIME.TUESDAY, fakeFarmEventWithExecutable(), 0));
    expect(calendar.getAll().length).toEqual(2);
    expect(calendar.value).toBeInstanceOf(Object);
    expect(calendar.value["061917"]).toBeInstanceOf(Array);
    expect(calendar.value["062017"]).toBeInstanceOf(Array);
  });

  it("finds by date", () => {
    const calendar = new Calendar();
    const wow = occurrence(TIME.MONDAY, fakeFarmEventWithExecutable(), 0);
    calendar.insert(wow);
    expect(calendar.findByDate(TIME.FRIDAY)).toBeInstanceOf(Array);
    expect(calendar.findByDate(TIME.MONDAY)).toContain(wow);
  });
  it("sorts CalendarDay");
  it("formats a date");
});
