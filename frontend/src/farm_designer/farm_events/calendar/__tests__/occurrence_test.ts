import { occurrence } from "../occurrence";
import * as moment from "moment";
import {
  TIME,
  fake_fe
} from "../../../../__test_support__/farm_event_calendar_support";

describe("occurrence", () => {
  it("builds a single entry for the calendar", () => {
    let fe = fake_fe();
    let t = occurrence(TIME.MONDAY, fe);
    expect(t.executableId).toBe(fe.executable_id);
    expect(t.mmdd).toBe("0619");
    expect(t.sortKey).toBe(moment(TIME.MONDAY).unix());
    expect(t.timeStr).toBe("01:30 am");
    expect(t.executableName).toBe(fe.executable.name);
    expect(t.id).toBe(fe.id);
  });
})
