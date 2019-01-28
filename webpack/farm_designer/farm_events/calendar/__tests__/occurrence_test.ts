import { occurrence } from "../occurrence";
import moment from "moment";
import {
  TIME,
  fakeFarmEventWithExecutable
} from "../../../../__test_support__/farm_event_calendar_support";

describe("occurrence", () => {
  it("builds a single entry for the calendar", () => {
    const fe = fakeFarmEventWithExecutable();
    const t = occurrence(TIME.MONDAY, fe, 0);
    expect(t.executableId).toBe(fe.executable_id);
    expect(t.mmddyy).toBe("061917");
    expect(t.sortKey).toBe(moment(TIME.MONDAY).unix());
    expect(t.heading).toBe(fe.executable.name);
    expect(t.id).toBe(fe.id);
  });

  it("builds entry with modified heading: hidden items", () => {
    const fe = fakeFarmEventWithExecutable();
    fe.executable.name = "Fake Sequence";
    const t = occurrence(TIME.MONDAY, fe, 0, { numHidden: 10 });
    expect(t.heading).toBe("+ 10 more: Fake Sequence");
  });

  it("builds entry with modified heading: no items", () => {
    const fe = fakeFarmEventWithExecutable();
    const t = occurrence(TIME.MONDAY, fe, 0, { empty: true });
    expect(t.heading).toBe("*Empty*");
  });
});
