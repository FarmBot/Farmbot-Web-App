import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { ResourceIndex } from "../../../resources/interfaces";
import { TaggedResource, SpecialStatus } from "../../../resources/tagged_resources";

export function fakeResourceIndex(): ResourceIndex {
  const fakeResources: TaggedResource[] = [
    {
      "specialStatus": SpecialStatus.SAVED,
      "kind": "Point",
      "body": {
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
      },
      "uuid": "plant"
    },
    {
      "specialStatus": SpecialStatus.SAVED,
      "kind": "Point",
      "body": {
        "id": 2,
        "meta": {},
        "name": "Point 1",
        "pointer_type": "GenericPointer",
        "radius": 10,
        "x": 10,
        "y": 20,
        "z": 30
      },
      "uuid": "point"
    },
    {
      "specialStatus": SpecialStatus.SAVED,
      "kind": "Point",
      "body": {
        "id": 3,
        "meta": {},
        "name": "ToolSlot 1",
        "pointer_type": "ToolSlot",
        "radius": 100,
        "x": 100,
        "y": 200,
        "z": 300,
        "tool_id": 1,
        "pullout_direction": 0
      },
      "uuid": "toolslot"
    },
    {
      "specialStatus": SpecialStatus.SAVED,
      "kind": "Tool",
      "body": {
        "id": 1,
        "name": "Generic Tool",
        "status": "active"
      },
      "uuid": "tool"
    }
  ];
  return buildResourceIndex(fakeResources).index;
}
