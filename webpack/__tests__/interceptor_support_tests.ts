import { isSafeError } from "../interceptor_support";

describe("isSafeError", () => {
  it("infers if it is safe to proceed", () => {
    const notSafe = { response: { status: "four oh four" } };
    expect(isSafeError(notSafe)).toBe(false);
    const safe = { response: { status: 404 } };
    expect(isSafeError(safe)).toBe(true);
  });
});
