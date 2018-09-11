import { actionList, PLANT_OPTIONS } from "../action_list";
import { betterMerge } from "../../../../util";
import { resourceUpdate } from "../assertion_support";
import {
  fakeTool,
  fakePlant,
  fakePoint
} from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../../__test_support__/resource_index_builder";

describe("actionList()", () => {
  const myIndex = () => buildResourceIndex([
    betterMerge(fakeTool(), { body: { name: "T1", id: 1 } }),
    fakePlant(),
    betterMerge(fakeTool(), { body: { name: "T2", id: 2 } }),
    betterMerge(fakePoint(), { body: { name: "my point", id: 7 } }),
    betterMerge(fakeTool(), { body: { name: "T3", id: undefined } }),
  ]);

  it("uses args.resource_type if DropDownItem is undefined", () => {
    const step = resourceUpdate({ resource_type: "Plant" });
    const { index } = myIndex();
    const result = actionList(undefined, step, index);
    expect(result).toEqual(PLANT_OPTIONS);
  });

  it("provides a list of tool mount actions", () => {
    const ddi = { label: "test case", value: 1, headingId: "Device" };
    const step = resourceUpdate({});
    const { index } = myIndex();
    const result = actionList(ddi, step, index);
    expect(result.length).toBe(3);
    const labels = result.map(x => x.label);
    expect(labels).toContain("Not Mounted");
    expect(labels).toContain("Mounted to: T1");
    expect(labels).toContain("Mounted to: T2");
  });

  it("provides a list of generic pointer actions", () => {
    const ddi = { label: "test case", value: 1, headingId: "GenericPointer" };
    const step = resourceUpdate({});
    const { index } = myIndex();
    const result = actionList(ddi, step, index);
    expect(result.length).toBe(1);
    const labels = result.map(x => x.label);
    expect(labels).toContain("Removed");
  });

  it("returns an empty list for all other options", () => {
    const ddi = { label: "test case", value: 1, headingId: "USB Cables" };
    const step = resourceUpdate({});
    const { index } = buildResourceIndex([]);
    const result = actionList(ddi, step, index);
    expect(result.length).toBe(0);
  });
});
