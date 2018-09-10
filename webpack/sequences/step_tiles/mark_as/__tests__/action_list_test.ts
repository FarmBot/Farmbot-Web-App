import { actionList } from "../action_list";
import { resourceUpdate } from "../assertion_support";
import { buildResourceIndex } from "../../../../__test_support__/resource_index_builder";
import { betterMerge } from "../../../../util";
import { fakeTool, fakePlant } from "../../../../__test_support__/fake_state/resources";

describe("actionList()", () => {
  it("Provides a list of tool mount actions", () => {
    const ddi = { label: "test case", value: 1, headingId: "Device" };
    const step = resourceUpdate({});
    const { index } = buildResourceIndex([
      betterMerge(fakeTool(), { body: { name: "T1", id: 1 } }),
      fakePlant(),
      betterMerge(fakeTool(), { body: { name: "T2", id: 2 } }),
      betterMerge(fakeTool(), { body: { name: "T3", id: undefined } }),
    ]);
    const result = actionList(ddi, step, index);
    expect(result.length).toBe(3);
    const labels = result.map(x => x.label);
    expect(labels).toContain("Not Mounted");
    expect(labels).toContain("Mounted to: T1");
    expect(labels).toContain("Mounted to: T2");
  });
});
