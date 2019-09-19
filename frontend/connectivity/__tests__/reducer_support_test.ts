import { getStatus } from "../reducer_support";
const NOW_UNIX =
  (new Date("Tue, 03 Oct 2017 09:00:00 -0500")).getTime();
describe("getStatus()", () => {
  it("returns 'down' when not given enough data", () => {
    expect(getStatus(undefined)).toBe("down");
  });

  it("returns status.state when given a ConnectionStatus object", () => {
    expect(getStatus({ at: NOW_UNIX, state: "up" })).toBe("up");
  });
});
