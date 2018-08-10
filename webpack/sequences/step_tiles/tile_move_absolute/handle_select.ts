/** Given a drop down item and a ResourceIndex,
 * figures out the corresponding Tool | Coordinate | Point */
import { DropDownItem } from "../../../ui/index";
import { ResourceIndex } from "../../../resources/interfaces";
import { KnownGroupTag, LocationData } from "./interfaces";
import { findPointerByTypeAndId, findToolById } from "../../../resources/selectors";
import { bail } from "../../../util";
import { ParameterDeclaration, Coordinate } from "farmbot";

export type CeleryVariable = LocationData | ParameterDeclaration;
export const EMPTY_COORD: Coordinate = {
  kind: "coordinate",
  args: { x: 0, y: 0, z: 0 }
};

/** Takes a DropDownItem and turns it into data suitable
* for MoveAbsolute["args"]["location"] */
export let handleSelect = (index: ResourceIndex, input: DropDownItem): CeleryVariable => {
  const tag = input.headingId as (KnownGroupTag | "parameter");
  const label = "" + input.value;
  const id = parseInt(label);
  switch (tag) {
    case "ToolSlot":
    case "GenericPointer":
    case "Plant":
      const p = findPointerByTypeAndId(index, tag, id);
      if (p && p.body.id) {
        return {
          kind: "point",
          args: { pointer_type: tag, pointer_id: p.body.id }
        };
      } else {
        return bail("Bad point_id: " + JSON.stringify(p));
      }
    case "Tool":
      const tool_id = findToolById(index, id)
        .body
        .id || bail("No id");
      return { kind: "tool", args: { tool_id } };
    case "identifier":
      return { kind: "identifier", args: { label } };
    case "parameter":
      // AUTHOR'S NOTE: At the time of writing, the only parameter supported
      // is `parent` which is always has a `data_type` of `point`. This will
      // need to be updated later.
      const data_type = "point";
      return { kind: "parameter_declaration", args: { label, data_type } };
    default:
      return EMPTY_COORD;
  }
};
