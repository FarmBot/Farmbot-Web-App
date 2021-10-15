import { msToTime } from "../utils";

describe("msToTime", () => {
  it("handles bad inputs", () => {
    expect(msToTime("0" as unknown as number)).toBe("00:01");
  });
});
