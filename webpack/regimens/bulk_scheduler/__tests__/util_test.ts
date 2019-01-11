import { msToTime } from "../utils";

describe("msToTime", () => {
  it("handles bad inputs", () => {
    // tslint:disable-next-line:no-any
    expect(msToTime("0" as any)).toBe("00:01");
  });
});
