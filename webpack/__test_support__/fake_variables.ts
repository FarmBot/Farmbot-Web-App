import { Coordinate } from "farmbot";
import { VariableNameSet } from "../resources/interfaces";

export const fakeVariableNameSet = (label = "parent"): VariableNameSet => {
  const data_value: Coordinate = {
    kind: "coordinate", args: { x: 0, y: 0, z: 0 }
  };
  return {
    [label]: {
      celeryNode: {
        kind: "variable_declaration",
        args: { label, data_value }
      },
      dropdown: { label: "", value: "" },
      vector: { x: 0, y: 0, z: 0 },
    }
  };
};
