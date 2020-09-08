import { msToTime } from "../utils";

describe("msToTime", () => {
  it("handles bad inputs", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(msToTime("0" as any)).toBe("00:01");
  });
});
