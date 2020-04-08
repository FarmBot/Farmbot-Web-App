import { actionList } from "../action_list";
import { resourceUpdate, markAsResourceFixture } from "../assertion_support";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { PLANT_OPTIONS } from "../constants";

describe("actionList()", () => {
  it("uses args.resource_type if DropDownItem is undefined", () => {
    const step = resourceUpdate({ resource_type: "Plant" });
    const { index } = markAsResourceFixture();
    const result = actionList(undefined, step, index);
    expect(result).toEqual(PLANT_OPTIONS());
  });

  it("provides a list of tool mount actions", () => {
    const ddi = { label: "test case", value: 1, headingId: "Device" };
    const step = resourceUpdate({});
    const { index } = markAsResourceFixture();
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
    const { index } = markAsResourceFixture();
    const result = actionList(ddi, step, index);
    expect(result.length).toBe(1);
    const labels = result.map(x => x.label);
    expect(labels).toContain("Removed");
  });

  it("provides a list of weed pointer actions", () => {
    const ddi = { label: "test case", value: 1, headingId: "Weed" };
    const step = resourceUpdate({});
    const { index } = markAsResourceFixture();
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
