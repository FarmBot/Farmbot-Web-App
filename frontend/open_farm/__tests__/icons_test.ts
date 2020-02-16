import { svgToUrl } from "../icons";

describe("svgToUrl()", () => {
  it("returns svg url", () => {
    expect(svgToUrl("icon")).toEqual("data:image/svg+xml;utf8,icon");
  });
});
