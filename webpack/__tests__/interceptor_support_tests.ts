jest.mock("../device", () => {
  return { getDevice: () => ({ publish: jest.fn() }) };
});

import { isSafeError, inferUpdateId } from "../interceptor_support";

describe("isSafeError", () => {
  it("infers if it is safe to proceed", () => {
    const notSafe = { response: { status: "four oh four" } };
    expect(isSafeError(notSafe)).toBe(false);
    const safe = { response: { status: 404 } };
    expect(isSafeError(safe)).toBe(true);
  });
});

describe("inferUpdateId", () => {
  it("it handles failure by returning `*`", () => {
    expect(inferUpdateId("foo/123/456")).toBe("*");
    // tslint:disable-next-line:no-any
    expect(inferUpdateId((true as any))).toBe("*");
  });

  it("handles normal URLs", () => {
    expect(inferUpdateId("foo/123")).toBe("123");
  });
});
