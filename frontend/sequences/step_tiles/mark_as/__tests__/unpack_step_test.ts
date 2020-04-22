import { fakeResourceIndex } from "../../../locals_list/test_helpers";
import { updateResource } from "../test_support";
import { unpackStep, TOOL_MOUNT, DISMOUNTED } from "../unpack_step";
import {
  selectAllPlantPointers,
  selectAllTools,
  selectAllWeedPointers,
} from "../../../../resources/selectors";
import { DropDownPair } from "../interfaces";
import { fakeTool, fakeWeed } from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
describe("unpackStep()", () => {
  function assertGoodness(result: DropDownPair,
    action_label: string,
    action_value: string,
    resource_label: string,
    resource_value: string | number): void {
    expect(result.rightSide.label).toBe(action_label);
    expect(result.rightSide.value).toBe(action_value);
    expect(result.leftSide.label).toBe(resource_label);
    expect(result.leftSide.value).toBe(resource_value);
  }

  it("unpacks empty tool_ids", () => {
    const result = unpackStep({
      step: updateResource(undefined, { label: "mounted_tool_id", value: 0 }),
      resourceIndex: fakeResourceIndex()
    });
    expect(result).toEqual(DISMOUNTED());
  });

  it("unpacks valid tool_ids", () => {
    const resourceIndex = fakeResourceIndex();
    const { body } = selectAllTools(resourceIndex)[0];
    expect(body).toBeTruthy();

    const result = unpackStep({
      step: updateResource(undefined,
        { label: "mounted_tool_id", value: body.id || NaN }),
      resourceIndex
    });
    const actionLabel = "Mounted to: Generic Tool";
    const { label, value } = TOOL_MOUNT();
    assertGoodness(result, actionLabel, "mounted", label, value);
  });

  it("unpacks valid tool_ids with missing names", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    tool.body.name = undefined;
    const resourceIndex = buildResourceIndex([tool]).index;
    const { body } = selectAllTools(resourceIndex)[0];
    expect(body).toBeTruthy();

    const result = unpackStep({
      step: updateResource(undefined,
        { label: "mounted_tool_id", value: body.id || NaN }),
      resourceIndex
    });
    const actionLabel = "Mounted to: Untitled Tool";
    const { label, value } = TOOL_MOUNT();
    assertGoodness(result, actionLabel, "mounted", label, value);
  });

  it("unpacks invalid tool_ids (that may have been valid previously)", () => {
    const result = unpackStep({
      step: updateResource(undefined,
        { label: "mounted_tool_id", value: Infinity }),
      resourceIndex: fakeResourceIndex()
    });
    const actionLabel = "Mounted to: an unknown tool";
    const { label, value } = TOOL_MOUNT();
    assertGoodness(result, actionLabel, "mounted", label, value);
  });

  it("unpacks plant_stage operations: plants", () => {
    const resourceIndex = fakeResourceIndex();
    const plant = selectAllPlantPointers(resourceIndex)[1];
    expect(plant).toBeTruthy();

    const result = unpackStep({
      step: updateResource({
        kind: "resource",
        args: { resource_type: "Plant", resource_id: plant.body.id || -1 }
      },
        { label: "plant_stage", value: "wilting" }),
      resourceIndex
    });
    const { body } = plant;
    const plantName = `${body.name} (${body.x}, ${body.y}, ${body.z})`;
    assertGoodness(result, "wilting", "wilting", plantName, body.id || NaN);
  });

  it("unpacks plant_stage operations: weeds", () => {
    const resourceIndex = fakeResourceIndex([fakeWeed()]);
    const weed = selectAllWeedPointers(resourceIndex)[1];
    expect(weed).toBeTruthy();

    const result = unpackStep({
      step: updateResource({
        kind: "resource",
        args: { resource_type: "Weed", resource_id: weed.body.id || -1 }
      },
        { label: "plant_stage", value: "removed" }),
      resourceIndex
    });
    const { body } = weed;
    const plantName = `${body.name} (${body.x}, ${body.y}, ${body.z})`;
    assertGoodness(result, "Removed", "removed", plantName, body.id || NaN);
  });

  it("unpacks plant_stage operations: identifier", () => {
    const resourceIndex = fakeResourceIndex();
    const result = unpackStep({
      step: updateResource(
        { kind: "identifier", args: { label: "var" } },
        { label: "plant_stage", value: "removed" }),
      resourceIndex
    });
    assertGoodness(result, "Removed", "removed", "var", "var");
  });

  it("unpacks unknown resource update_resource steps", () => {
    const result = unpackStep({
      step: updateResource(),
      resourceIndex: fakeResourceIndex()
    });
    assertGoodness(result,
      "some_value", "some_value",
      "Other 1 some_attr", "some_attr");
  });

  it("unpacks unknown identifier update_resource steps", () => {
    const result = unpackStep({
      step: updateResource({ kind: "identifier", args: { label: "var" } }),
      resourceIndex: fakeResourceIndex()
    });
    assertGoodness(result,
      "some_value", "some_value",
      "variable 0 some_attr", "some_attr");
  });
});
