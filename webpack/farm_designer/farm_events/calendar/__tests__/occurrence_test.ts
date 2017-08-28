import { occurrence } from "../occurrence";
import * as moment from "moment";
import {
  TIME,
  fakeFarmEventWithExecutable
} from "../../../../__test_support__/farm_event_calendar_support";

describe("occurrence", () => {
  it("builds a single entry for the calendar", () => {
    const fe = fakeFarmEventWithExecutable();
    const t = occurrence(TIME.MONDAY, fe);
    expect(t.executableId).toBe(fe.executable_id);
    expect(t.mmddyy).toBe("061917");
    expect(t.sortKey).toBe(moment(TIME.MONDAY).unix());
    expect(t.heading).toBe(fe.executable.name);
    expect(t.id).toBe(fe.id);
  });
});
