import { prettyPrintApiErrors, catchErrors } from "../errors";
import { Content } from "../../constants";

describe("prettyPrintApiErrors", () => {
  it("handles properly formatted API error messages", () => {
    const result = prettyPrintApiErrors({
      response: { data: { email: "can't be blank" } }
    });
    expect(result).toEqual("Email: can't be blank");
  });

  it("handles improperly formatted API error messages", () => {
    expect(prettyPrintApiErrors({ response: { data: "unknown" } }))
      .toEqual("Error: unknown");
    expect(prettyPrintApiErrors({
      response: {
        data: "<!DOCTYPE html>...",
        statusText: "unknown",
      }
    })).toEqual("Error: unknown");
    expect(prettyPrintApiErrors({ response: { data: "<!DOCTYPE html>..." } }))
      .toEqual("Error: bad response");
    expect(prettyPrintApiErrors({ response: undefined }))
      .toContain(Content.WEB_APP_DISCONNECTED);
  });
});

describe("catchErrors", () => {
  it("re-raises errors when Rollbar is not detected", () => {
    const e = new Error("TEST");
    expect(() => catchErrors(e)).toThrow("TEST");
  });
});
