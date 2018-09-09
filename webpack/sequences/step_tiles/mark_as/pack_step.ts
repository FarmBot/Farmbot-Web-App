import { ResourceUpdate } from "farmbot";
import { DropDownItem } from "../../../ui";

/** Using the current state of the "mark as" step */
export const packStep =
  (csNode: ResourceUpdate,
    resourceDDI: DropDownItem | undefined,
    actionDDI: DropDownItem): ResourceUpdate => {
    const resource_type = "" + (resourceDDI ?
      resourceDDI.headingId : csNode.args.resource_type);
    const resource_id = (resourceDDI ?
      resourceDDI.value : csNode.args.resource_id) as number;
    switch (resource_type) {
      case "Device":
        /* Scenario I: Changing tool mount */
        return {
          kind: "resource_update",
          args: {
            resource_id,
            resource_type,
            label: "mounted_tool_id",
            value: actionDDI.value
          }
        };

      default:
        /* Scenario II: Changing a point  */
        const label = "" +
          (actionDDI.value == "removed" ? "discarded_at" : "plant_stage");
        const value = "" +
          (label === "discarded_at" ? "{{ Time.now }}" : actionDDI.value);
        return {
          kind: "resource_update",
          args: { resource_id, resource_type, label, value }
        };
    }
  };
