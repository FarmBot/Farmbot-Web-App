import { ResourceUpdate } from "farmbot";
import { DropDownItem } from "../../../ui";

export const packStep =
  (origin: ResourceUpdate,
    nextResource: DropDownItem | undefined,
    nextAction: DropDownItem): ResourceUpdate => {
    console.error("FIXME");
    debugger;
    return {
      kind: "resource_update",
      args: {
        resource_id: 0,
        resource_type: "Tool",
        label: "name",
        value: "FIXME"
      }
    };
  };
