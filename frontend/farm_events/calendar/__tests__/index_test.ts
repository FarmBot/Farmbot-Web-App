import { Calendar } from "../index";
import {
  fakeFarmEventWithExecutable,
} from "../../../__test_support__/farm_event_calendar_support";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

const moment: typeof import("moment") = jest.requireActual("moment");
const { occurrence }: typeof import("../occurrence") =
  jest.requireActual("../occurrence");
const MONDAY = moment("2017-06-19T06:30:00.000-05:00");
const TUESDAY = moment("2017-06-20T06:30:00.000-05:00");
const FRIDAY = moment("2017-06-23T06:30:00.000-05:00");

describe("calendar", () => {
  const fe = fakeFarmEventWithExecutable();
  const timeSettings = fakeTimeSettings();
  const ri = buildResourceIndex([]).index;

  it("constructs itself with defaults", () => {
    const calendar = new Calendar();
    expect(calendar.getAll().length).toEqual(0);
    expect(calendar.value).toEqual({});
  });

  it("inserts dates", () => {
    const calendar = new Calendar();
    calendar.insert(occurrence(MONDAY, fe, timeSettings, ri));
    calendar.insert(occurrence(TUESDAY, fe, timeSettings, ri));
    expect(calendar.value).toEqual(expect.objectContaining({
      "061917": expect.any(Array),
      "062017": expect.any(Array)
    }));
  });

  it("finds by date", () => {
    const calendar = new Calendar();
    const wow = occurrence(MONDAY, fe, timeSettings, ri);
    calendar.insert(wow);
    expect(calendar.findByDate(FRIDAY)).toBeInstanceOf(Array);
    expect(calendar.findByDate(MONDAY)).toContain(wow);
  });

  it("sorts CalendarDay", () => {
    const calendar = new Calendar();
    const earlyDay = moment("2017-10-10T06:00:00.000Z");
    const lateDay = moment("2017-10-10T17:00:00.000Z");
    calendar.insert(occurrence(lateDay, fe, timeSettings, ri));
    calendar.insert(occurrence(earlyDay, fe, timeSettings, ri));
    const items = calendar.getAll()[0].items;
    expect(items[0].sortKey < items[1].sortKey).toBeTruthy();
  });

  it("formats a date", () => {
    const calendar = new Calendar();
    calendar.insert(occurrence(MONDAY, fe, timeSettings, ri));
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
