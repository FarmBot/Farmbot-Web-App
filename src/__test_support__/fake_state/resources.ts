import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../resource_index_builder";
import { TaggedFarmEvent } from "../../resources/tagged_resources";
import { ExecutableType } from "../../farm_designer/interfaces";

export let resources: Everything["resources"] = buildResourceIndex();

export function fakeFarmEvent(exe_type: ExecutableType,
  exe_id: number): TaggedFarmEvent {
  return {
    "kind": "farm_events",
    uuid: "---",
    "body": {
      "id": 21,
      "start_time": "2017-05-22T05:00:00.000Z",
      "end_time": "2017-05-30T05:00:00.000Z",
      "repeat": 1,
      "time_unit": "never",
      "executable_id": exe_id,
      "executable_type": exe_type,
      "calendar": []
    }
  };
}
