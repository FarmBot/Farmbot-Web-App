import { fakeFbosConfig } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { getFbosConfig } from "../getters";

describe("getFbosConfig()", () => {
  it("returns fbosConfig", () => {
    const config = fakeFbosConfig();
    expect(getFbosConfig(buildResourceIndex([config]).index)).toEqual(config);
  });
});
