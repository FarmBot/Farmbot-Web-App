import { unpackStep } from "../unpack_step";
import { fakeResourceIndex } from "../../tile_move_absolute/test_helpers";
import { ResourceUpdate } from "farmbot";
import { selectAllPlantPointers } from "../../../../resources/selectors";

describe("unpackStep()", () => {
  function step(i: Partial<ResourceUpdate["args"]>): ResourceUpdate {
    return {
      kind: "resource_update",
      args: {
        resource_type: "Other",
        resource_id: 1,
        label: "some_attr",
        value: "some_value",
        ...i
      }
    };
  }

  it("unpacks discarded_at operations", () => {
    const resourceIndex = fakeResourceIndex();
    const plant = selectAllPlantPointers(resourceIndex)[1];
    expect(plant).toBeTruthy();

    const result = unpackStep({
      step: step({
        resource_type: "Plant",
        resource_id: plant.body.id || -1,
        label: "discarded_at",
        value: "non-configurable"
      }), resourceIndex
    });
    expect(result.action.label).toBe("Removed");
    expect(result.action.value).toBe("removed");
    const { body } = plant;
    expect(result.resource.label)
      .toBe(`${body.name} (${body.x}, ${body.y}, ${body.z})`);
    expect(result.resource.value).toBe(body.id);
  });

  it("unpacks plant_stage operations", () => {
    const resourceIndex = fakeResourceIndex();
    const plant = selectAllPlantPointers(resourceIndex)[1];
    expect(plant).toBeTruthy();

    const result = unpackStep({
      step: step({
        resource_type: "Plant",
        resource_id: plant.body.id || -1,
        label: "plant_stage",
        value: "wilting"
      }), resourceIndex
    });
    expect(result.action.label).toBe("Wilting");
    expect(result.action.value).toBe("wilting");
    expect(result.resource.label).toBe(plant.body.name);
    expect(result.resource.value).toBe(plant.uuid); // Why uuid for plants? -RC
  });

  it("unpacks unknown resource_update steps", () => {
    const result = unpackStep({
      step: step({}),
      resourceIndex: fakeResourceIndex()
    });
    expect(result.action.label).toBe("some_attr = some_value");
    expect(result.action.value).toBe("some_value");
    expect(result.resource.label).toBe("Other");
    expect(result.resource.value).toBe(1);
  });
});
