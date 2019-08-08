import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { ResourceIndex } from "../../resources/interfaces";
import { TaggedResource } from "farmbot";
import { newTaggedResource } from "../../sync/actions";

export function fakeResourceIndex(): ResourceIndex {
  const fakeResources: TaggedResource[] = [
    ...newTaggedResource("Point", {
      "id": 1,
      "meta": {},
      "name": "Plant 1",
      "pointer_type": "Plant",
      "radius": 1,
      "x": 1,
      "y": 2,
      "z": 3,
      "openfarm_slug": "garlic",
      "plant_stage": "planned"
    }),
    ...newTaggedResource("Point", {
      "id": 2,
      "meta": {},
      "name": "Point 1",
      "pointer_type": "GenericPointer",
      "radius": 10,
      "x": 10,
      "y": 20,
      "z": 30
    }),
    ...newTaggedResource("Point", {
      "id": 3,
      "meta": {},
      "name": "ToolSlot 1",
      "pointer_type": "ToolSlot",
      "radius": 100,
      "x": 100,
      "y": 200,
      "z": 300,
      "tool_id": 1,
      "pullout_direction": 0,
      "gantry_mounted": false,
    }),
    ...newTaggedResource("Point", {
      "id": 4,
      "meta": {},
      "name": "dandelion",
      "pointer_type": "Plant",
      "openfarm_slug": "potato",
      "plant_stage": "harvested",
      "radius": 100,
      "x": 100,
      "y": 200,
      "z": 300,
    }),
    ...newTaggedResource("Tool", {
      "id": 1,
      "name": "Generic Tool",
      "status": "active"
    })
  ];
  return buildResourceIndex(fakeResources).index;
}
