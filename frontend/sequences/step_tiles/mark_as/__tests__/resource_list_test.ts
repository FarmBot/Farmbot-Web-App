import { resourceList } from "../resource_list";
import { markAsResourceFixture } from "../assertion_support";

describe("resourceList()", () => {
  it("lists defaults, plus saved points", () => {
    const { index } = markAsResourceFixture();
    const result = resourceList(index);
    expect(result.length).toBeTruthy();
    const headings = result.filter(x => x.heading).map(x => x.label);
    expect(headings).toContain("Device");
    expect(headings).toContain("Plants");
    expect(headings).toContain("Points");
    expect(headings).toContain("Weeds");
    const weeds = result.filter(x => x.headingId == "Weed");
    expect(weeds.length).toEqual(2);
    expect(weeds[1].label).toEqual("weed 1 (200, 400, 0)");
  });
});
