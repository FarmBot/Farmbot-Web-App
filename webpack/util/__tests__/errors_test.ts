import { prettyPrintApiErrors } from "../errors";

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
