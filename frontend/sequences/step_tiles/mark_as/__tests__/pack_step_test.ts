import { updateResource } from "../test_support";
import { packStep } from "../pack_step";
import { TOP_HALF } from "../constants";
import { Resource, Identifier } from "farmbot";

describe("packStep()", () => {
  const plant = updateResource({
    kind: "resource",
    args: { resource_type: "Plant", resource_id: 6 }
  });

  it("serializes 'plant_stage' actions", () => {
    const actionDDI = { value: "harvested", label: "harvested" };
    const { args, body } = packStep(plant, undefined, actionDDI);
    expect(body?.[0].args.label).toEqual("plant_stage");
    expect(body?.[0].args.value).toEqual("harvested");
    expect((args.resource as Resource).args.resource_id).toEqual(6);
    expect((args.resource as Resource).args.resource_type).toEqual("Plant");
  });

  it("serializes 'mounted_tool_id' actions", () => {
    const resourceDDI = TOP_HALF[0];
    const actionDDI = { value: 23, label: "Mounted to can opener" };
    const device = updateResource({
      kind: "resource",
      args: { resource_type: "Device", resource_id: 7 }
    });
    const { args, body } = packStep(device, resourceDDI, actionDDI);
    expect(body?.[0].args.label).toEqual("mounted_tool_id");
    expect((args.resource as Resource).args.resource_type).toEqual("Device");
    expect((args.resource as Resource).args.resource_id).toEqual(0);
    expect(body?.[0].args.value).toEqual(23);
  });

  it("serializes 'plant_stage' actions: identifier", () => {
    const actionDDI = { value: "harvested", label: "harvested" };
    const identifier = updateResource({
      kind: "identifier", args: { label: "var" }
    });
    const { args, body } = packStep(identifier, undefined, actionDDI);
    expect(body?.[0].args.label).toEqual("plant_stage");
    expect(body?.[0].args.value).toEqual("harvested");
    expect((args.resource as Identifier).args.label).toEqual("var");
  });
});
