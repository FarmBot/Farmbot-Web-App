import { fail, FAILURE_PAGE } from "../verification_support";

describe("fail()", () => {
  fit("writes a failure message", () => {
    expect(fail).toThrow();
    expect(document.documentElement.outerHTML).toContain(FAILURE_PAGE);
  });
});
