import { Calendar } from "../index";
import { occurrence } from "../occurrence";
import {
  TIME,
  fakeFarmEventWithExecutable,
} from "../../../../__test_support__/farm_event_calendar_support";
import moment from "moment";
import { fakeTimeSettings } from "../../../../__test_support__/fake_time_settings";

describe("calendar", () => {
  it("constructs itself with defaults", () => {
    const calendar = new Calendar();
    expect(calendar.getAll().length).toEqual(0);
    expect(calendar.value).toEqual({});
  });

  it("inserts dates", () => {
    const calendar = new Calendar();
    calendar.insert(occurrence(
      TIME.MONDAY, fakeFarmEventWithExecutable(), fakeTimeSettings()));
    calendar.insert(occurrence(
      TIME.TUESDAY, fakeFarmEventWithExecutable(), fakeTimeSettings()));
    expect(calendar.value).toEqual(expect.objectContaining({
      "061917": expect.any(Array),
      "062017": expect.any(Array)
    }));
  });

  it("finds by date", () => {
    const calendar = new Calendar();
    const wow = occurrence(
      TIME.MONDAY, fakeFarmEventWithExecutable(), fakeTimeSettings());
    calendar.insert(wow);
    expect(calendar.findByDate(TIME.FRIDAY)).toBeInstanceOf(Array);
    expect(calendar.findByDate(TIME.MONDAY)).toContain(wow);
  });

  it("sorts CalendarDay", () => {
    const calendar = new Calendar();
    const earlyDay = moment("2017-10-10T06:00:00.000Z");
    const lateDay = moment("2017-10-10T17:00:00.000Z");
    calendar.insert(occurrence(
      lateDay, fakeFarmEventWithExecutable(), fakeTimeSettings()));
    calendar.insert(occurrence(
      earlyDay, fakeFarmEventWithExecutable(), fakeTimeSettings()));
    const items = calendar.getAll()[0].items;
    expect(items[0].sortKey < items[1].sortKey).toBeTruthy();
  });

  it("formats a date", () => {
    const calendar = new Calendar();
    calendar.insert(occurrence(
      TIME.MONDAY, fakeFarmEventWithExecutable(), fakeTimeSettings()));
    const day = calendar.getAll()[0];
    expect(day).toEqual(expect.objectContaining({
      day: 19,
      month: "Jun",
      year: 17,
      sortKey: expect.any(Number),
      items: expect.any(Array)
    }));
  });
});
