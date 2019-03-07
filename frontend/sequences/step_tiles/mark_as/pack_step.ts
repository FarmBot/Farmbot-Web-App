import { ResourceUpdate, resource_type as RESOURCE_TYPE } from "farmbot";
import { DropDownItem } from "../../../ui";

/**
 * This is a support function for the <MarkAs/> component.
 *
 * SCENARIO: You are editing a `Mark As..` sequence step. The user has unsaved
 *            local changes as well as a copy of older data from the API.
 *
 * PROBLEM:   You need to take the component's local state plus the
 *            shape of the "resource_update" ("Mark As..") block and merge them
 *            together so that you can render the form in the editor.
 *
 * SOLUTION:  Use the celery node + pieces of the component's state (resourceDDI,
 *            actionDDI) to properly populate dropdown menus and determine the
 *            shape of the new "resource_update" step when it is saved.
 * */
export const packStep =
  (csNode: ResourceUpdate,
    resourceDDI: DropDownItem | undefined,
    actionDDI: DropDownItem): ResourceUpdate => {
    const resource_type = (resourceDDI ?
      resourceDDI.headingId : csNode.args.resource_type) as RESOURCE_TYPE;
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
