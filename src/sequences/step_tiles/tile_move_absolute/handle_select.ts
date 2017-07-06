/** Given a dropdown item and a ResourceIndex,
 * figures out the corresponding Tool | Coordinate | Point */
import { DropDownItem } from "../../../ui/index";
import { ResourceIndex } from "../../../resources/interfaces";
import { KnownGroupTag, LocationData, CALLBACK } from "./interfaces";
import { findPointerByTypeAndId, findToolById } from "../../../resources/selectors";

/** Takes a DropDownItem and turns it into data suitable
 * for MoveAbsolute["args"]["location"] */
export let handleSelect = (index: ResourceIndex, input: DropDownItem): LocationData => {
  let tag = input.headingId as KnownGroupTag;
  let id = parseInt("" + input.value);
  switch (tag) {
    case "ToolSlot":
    case "GenericPointer":
    case "Plant":
      let p = findPointerByTypeAndId(index, tag, id);
      if (p && p.body.id) {
        return {
          kind: "point",
          args: { pointer_type: tag, pointer_id: p.body.id }
        };
      } else {
        return bail("Bad point_id: " + JSON.stringify(p));
      }
    case "Tool":
      let tool_id = findToolById(index, id)
        .body
        .id || bail("No id");
      return { kind: "tool", args: { tool_id } };
    default:
      return { kind: "coordinate", args: { x: 0, y: 0, z: 0 } };
  }
};

function bail(msg: string): never {
  throw new Error(msg);
}
