import { parseClassNames } from "../util";

describe("parseClassNames", () => {
  it("parses class names correctly", () => {
    const base = "hello, base.";
    const results = parseClassNames({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xsOffset: 5,
      smOffset: 6,
      mdOffset: 7,
      lgOffset: 8,
    }, base);

    [
      base,
      "col-xs-1",
      "col-sm-2",
      "col-md-3",
      "col-lg-4",
      "col-xs-offset-5",
      "col-sm-offset-6",
      "col-md-offset-7",
      "col-lg-offset-8",
    ].map(string => expect(results).toContain(string));
  });
});
