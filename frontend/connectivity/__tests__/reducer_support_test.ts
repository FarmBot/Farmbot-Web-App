import { computeBestTime, getStatus, maxDate } from "../reducer_support";
import moment from "moment";
import { ConnectionStatus } from "../interfaces";

// RELEVANT:
// https://en.wikipedia.org/wiki/Now_and_Later
const NOW = "Tue, 03 Oct 2017 09:00:00 -0500";
const LATER = "Wed, 04 Oct 2017 09:00:00 -0500";

const LATER_JSON = moment(LATER).toDate().getTime();
const NOW_UNIX = (new Date(NOW)).getTime();

describe("computeBestTime()", () => {
  const STUB: ConnectionStatus = { state: "down", at: NOW_UNIX };

  it("returns same input when `last_saw_mq` is unavailable", () => {
    expect(computeBestTime(undefined, undefined)).toBe(undefined);
    expect(computeBestTime(STUB, undefined)).toBe(STUB);
    const hmm = computeBestTime(undefined, LATER);
    expect(hmm && hmm.at).toEqual(LATER_JSON);
  });

  it("computes best time when enough information is present", () => {
    const expected: ConnectionStatus = { state: "down", at: LATER_JSON };
    expect(computeBestTime(STUB, LATER)).toEqual(expected);
  });
});

describe("maxDate()", () => {
  it("picks the max time, regardless of position", () => {
    expect(maxDate(moment(NOW), moment(LATER))).toBe(LATER_JSON);
    expect(maxDate(moment(LATER), moment(NOW))).toBe(LATER_JSON);
  });

  it("picks dates[0] when there is a tie", () => {
    expect(maxDate(moment(LATER), moment(LATER))).toBe(LATER_JSON);
  });
});

describe("getStatus()", () => {
  it("returns 'down' when not given enough data", () => {
    expect(getStatus(undefined)).toBe("down");
  });

  it("returns status.state when given a ConnectionStatus object", () => {
    expect(getStatus({ at: NOW_UNIX, state: "up" })).toBe("up");
  });
});
