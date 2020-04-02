import { fakeResourceIndex } from "../../../locals_list/test_helpers";
import { resourceUpdate } from "../assertion_support";
import { unpackStep, TOOL_MOUNT, DISMOUNTED } from "../unpack_step";
import {
  selectAllPlantPointers,
  selectAllTools,
  selectAllGenericPointers,
} from "../../../../resources/selectors";
import { DropDownPair } from "../interfaces";
import { fakeTool } from "../../../../__test_support__/fake_state/resources";
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
      step: resourceUpdate({ label: "mounted_tool_id", value: 0 }),
      resourceIndex: fakeResourceIndex()
    });
    expect(result).toEqual(DISMOUNTED());
  });

  it("unpacks valid tool_ids", () => {
    const resourceIndex = fakeResourceIndex();
    const { body } = selectAllTools(resourceIndex)[0];
    expect(body).toBeTruthy();

    const result = unpackStep({
      step: resourceUpdate({ label: "mounted_tool_id", value: body.id || NaN }),
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
      step: resourceUpdate({ label: "mounted_tool_id", value: body.id || NaN }),
      resourceIndex
    });
    const actionLabel = "Mounted to: Untitled Tool";
    const { label, value } = TOOL_MOUNT();
    assertGoodness(result, actionLabel, "mounted", label, value);
  });

  it("unpacks invalid tool_ids (that may have been valid previously)", () => {
    const result = unpackStep({
      step: resourceUpdate({ label: "mounted_tool_id", value: Infinity }),
      resourceIndex: fakeResourceIndex()
    });
    const actionLabel = "Mounted to: an unknown tool";
    const { label, value } = TOOL_MOUNT();
    assertGoodness(result, actionLabel, "mounted", label, value);
  });

  it("unpacks discarded_at operations", () => {
    const resourceIndex = fakeResourceIndex();
    const { body } = selectAllGenericPointers(resourceIndex)[0];
    expect(body.pointer_type).toBe("GenericPointer");

    const result = unpackStep({
      step: resourceUpdate({
        resource_type: "GenericPointer",
        resource_id: body.id || -1,
        label: "discarded_at",
        value: "non-configurable"
      }), resourceIndex
    });
    assertGoodness(result,
      "Removed",
      "removed",
      `${body.name} (${body.x}, ${body.y}, ${body.z})`,
      body.id || NaN);
  });

  it("unpacks plant_stage operations", () => {
    const resourceIndex = fakeResourceIndex();
    const plant = selectAllPlantPointers(resourceIndex)[1];
    expect(plant).toBeTruthy();

    const result = unpackStep({
      step: resourceUpdate({
        resource_type: "Plant",
        resource_id: plant.body.id || -1,
        label: "plant_stage",
        value: "wilting"
      }), resourceIndex
    });
    const { body } = plant;
    const plantName = `${body.name} (${body.x}, ${body.y}, ${body.z})`;
    assertGoodness(result, "wilting", "wilting", plantName, body.id || NaN);
  });

  it("unpacks unknown resource_update steps", () => {
    const result = unpackStep({
      step: resourceUpdate({}),
      resourceIndex: fakeResourceIndex()
    });
    assertGoodness(result, "some_attr = some_value", "some_value", "Other", 1);
  });
});
