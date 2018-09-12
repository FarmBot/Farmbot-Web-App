import { resourceUpdate } from "../assertion_support";
import { packStep } from "../pack_step";
import { TOP_HALF } from "../constants";

describe("packStep()", () => {
  const plant = resourceUpdate({ resource_type: "Plant", resource_id: 6 });

  it("serializes 'discard' actions", () => {
    const actionDDI = { value: "removed", label: "Removed" };
    const { args } = packStep(plant, undefined, actionDDI);
    expect(args.label).toEqual("discarded_at");
    expect(args.value).toEqual("{{ Time.now }}");
    expect(args.resource_id).toEqual(6);
    expect(args.resource_type).toEqual("Plant");
  });

  it("serializes 'plant_stage' actions", () => {
    const actionDDI = { value: "harvested", label: "harvested" };
    const { args } = packStep(plant, undefined, actionDDI);
    expect(args.label).toEqual("plant_stage");
    expect(args.value).toEqual("harvested");
    expect(args.resource_id).toEqual(6);
    expect(args.resource_type).toEqual("Plant");
  });

  it("serializes 'mounted_tool_id' actions", () => {
    const resourceDDI = TOP_HALF[0];
    const actionDDI = { value: 23, label: "Mounted to can opener" };
    const device = resourceUpdate({ resource_type: "Device", resource_id: 7 });
    const { args } = packStep(device, resourceDDI, actionDDI);
    expect(args.label).toEqual("mounted_tool_id");
    expect(args.resource_type).toEqual("Device");
    expect(args.resource_id).toEqual(0);
    expect(args.value).toEqual(23);
  });
});
