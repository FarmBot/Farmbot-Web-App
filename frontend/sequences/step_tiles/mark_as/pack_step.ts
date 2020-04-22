import { UpdateResource, Resource, Identifier, resource_type } from "farmbot";
import { DropDownItem } from "../../../ui";

/**
 * This is a support function for the <MarkAs/> component.
 *
 * SCENARIO: You are editing a `Mark As..` sequence step. The user has unsaved
 *            local changes as well as a copy of older data from the API.
 *
 * PROBLEM:   You need to take the component's local state plus the
 *            shape of the "update_resource" ("Mark As..") block and merge them
 *            together so that you can render the form in the editor.
 *
 * SOLUTION:  Use the celery node + pieces of the component's state (resourceDDI,
 *            actionDDI) to properly populate dropdown menus and determine the
 *            shape of the new "update_resource" step when it is saved.
 * */
export const packStep = (
  csNode: UpdateResource,
  resourceDDI: DropDownItem | undefined,
  actionDDI: DropDownItem,
): UpdateResource => {
  const resource = resourceDDI?.headingId
    ? resourceNode(resourceDDI.headingId, resourceDDI.value)
    : csNode.args.resource;
  if (resource.kind == "identifier") {
    return updateResource(resource, "plant_stage", actionDDI.value);
  } else {
    switch (resource.args.resource_type) {
      case "Device":
        /* Scenario I: Changing tool mount */
        return updateResource(resource, "mounted_tool_id", actionDDI.value);
      default:
        /* Scenario II: Changing a point  */
        return updateResource(resource, "plant_stage", actionDDI.value);
    }
  }
};

const resourceNode = (type: string, id: string | number): Resource => ({
  kind: "resource",
  args: {
    resource_type: type as resource_type,
    resource_id: parseInt("" + id),
  }
});

const updateResource = (
  resource: Resource | Identifier,
  field: string,
  value: string | number,
): UpdateResource => ({
  kind: "update_resource",
  args: { resource },
  body: [{
    kind: "pair", args: {
      label: field,
      value: value,
    }
  }]
});
