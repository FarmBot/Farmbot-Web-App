import { prettyPrintApiErrors, catchErrors } from "../errors";

describe("prettyPrintApiErrors", () => {
  it("handles properly formatted API error messages", () => {
    const result = prettyPrintApiErrors({
      response: {
        data: {
          email: "can't be blank"
        }
      }
    });
    expect(result).toEqual("Email: can't be blank");
  });
});

describe("catchErrors", () => {
  it("re-raises errors when Rollbar is not detected", () => {
    const e = new Error("TEST");
    expect(() => catchErrors(e)).toThrow("TEST");
  });
});
