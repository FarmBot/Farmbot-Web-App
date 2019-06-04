import { OpenFarmAPI, svgToUrl } from "../icons";

describe("OpenFarmAPI", () => {
  it("has a base URL", () => {
    expect(OpenFarmAPI.OFBaseURL).toContain("openfarm.cc");
  });
});

describe("svgToUrl()", () => {
  it("returns svg url", () => {
    expect(svgToUrl("icon")).toEqual("data:image/svg+xml;utf8,icon");
  });
});
