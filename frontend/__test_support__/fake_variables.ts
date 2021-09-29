import { Coordinate } from "farmbot";
import { VariableNameSet } from "../resources/interfaces";
import { VariableNode } from "../sequences/locals_list/locals_list_support";

export const fakeVariableNameSet = (
  label = "label",
  vector = { x: 0, y: 0, z: 0 },
  node: VariableNode | undefined = undefined,
  ddiLabel = "fake variable info label",
): VariableNameSet => {
  const data_value: Coordinate = {
    kind: "coordinate", args: vector
  };
  return {
    [label]: {
      celeryNode: node || {
        kind: "parameter_application",
        args: { label, data_value }
      },
      dropdown: { label: ddiLabel, value: "" },
      vector,
    }
  };
};
