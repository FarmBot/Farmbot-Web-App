import {
  addOrEditBodyVariables, convertDDItoVariable, NOTHING,
} from "../handle_select";
import { Point, Tool, Coordinate, Nothing } from "farmbot";
import {
  NO_VALUE_SELECTED_DDI, COORDINATE_DDI, LOCATION_PLACEHOLDER_DDI,
} from "../variable_form_list";
import {
  VariableNode, AllowedVariableNodes, VariableType,
} from "../locals_list_support";

const label = "label";
const allowedVariableNodes = AllowedVariableNodes.variable;
const expectedVariable = (data_value: Point | Tool | Coordinate | Nothing) =>
  ({ kind: "parameter_application", args: { label, data_value } });

describe("convertDDItoDeclaration()", () => {
  it("handles malformed items", () => {
    console.error = jest.fn();
    const result = convertDDItoVariable({
      identifierLabel: "Y",
      allowedVariableNodes,
      dropdown: {
        headingId: "something_else",
        label: "X",
        value: 23
      }
    });
    expect(result).toEqual(undefined);
    expect(console.error).toHaveBeenCalledWith(
      "WARNING: Don't know how to handle something_else");
  });

  it("handles point groups", () => {
    const result = convertDDItoVariable({
      identifierLabel: "Y",
      allowedVariableNodes,
      dropdown: {
        headingId: "PointGroup",
        label: "X",
        value: 23
      }
    });
    expect(result).toEqual({
      kind: "parameter_application",
      args: {
        label: "Y",
        data_value: { kind: "point_group", args: { point_group_id: 23 } }
      }
    });
  });

  it("returns location data: point", () => {
    const dropdown =
      ({ headingId: "GenericPointer", label: "Point 1 (10, 20, 30)", value: 2 });
    const variable = convertDDItoVariable({
      identifierLabel: label,
      allowedVariableNodes,
      dropdown
    });
    expect(variable).toEqual(expectedVariable({
      kind: "point",
      args: {
        pointer_id: 2,
        pointer_type: "GenericPointer"
      }
    }));
  });

  it("returns location data: tool", () => {
    const dropdown = { headingId: "Tool", label: "Generic Tool", value: 1 };
    const variable =
      convertDDItoVariable({
        identifierLabel: label, allowedVariableNodes, dropdown
      });
    expect(variable).toEqual(expectedVariable({
      kind: "tool", args: { tool_id: 1 }
    }));
  });

  it("returns location data: Plant", () => {
    const dropdown = { headingId: "Plant", label: "Mint", value: 1 };
    const variable =
      convertDDItoVariable({
        identifierLabel: label, allowedVariableNodes, dropdown
      });
    expect(variable).toEqual(expectedVariable({
      kind: "point", args: { pointer_id: 1, pointer_type: "Plant" }
    }));
  });

  it("returns location data: default", () => {
    const variable = convertDDItoVariable({
      identifierLabel: label,
      allowedVariableNodes,
      dropdown: NO_VALUE_SELECTED_DDI()
    });
    expect(variable).toEqual(expectedVariable(NOTHING as Nothing));
  });

  it("returns variable declaration: default", () => {
    const expected = expectedVariable(NOTHING as Nothing);
    expected.kind = "variable_declaration";
    const variable = convertDDItoVariable({
      identifierLabel: label,
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown: NO_VALUE_SELECTED_DDI()
    });
    expect(variable).toEqual(expected);
  });

  it("returns location data: coordinate", () => {
    const variable = convertDDItoVariable({
      identifierLabel: label, allowedVariableNodes,
      dropdown: COORDINATE_DDI({ x: 1, y: 2, z: 3 })
    });
    expect(variable).toEqual(expectedVariable({
      kind: "coordinate", args: { x: 1, y: 2, z: 3 }
    }));
  });

  it("returns location placeholder", () => {
    const variable = convertDDItoVariable({
      identifierLabel: label, allowedVariableNodes,
      dropdown: LOCATION_PLACEHOLDER_DDI(),
    });
    expect(variable).toEqual({
      kind: "parameter_application",
      args: { label, data_value: { kind: "location_placeholder", args: {} } }
    });
  });

  it("returns location data: new coordinate", () => {
    const variable = convertDDItoVariable({
      identifierLabel: label, allowedVariableNodes,
      dropdown: COORDINATE_DDI()
    });
    expect(variable).toEqual(expectedVariable({
      kind: "coordinate", args: { x: 0, y: 0, z: 0 }
    }));
  });

  it("returns location data: parameter_declaration", () => {
    const dropdown = ({
      headingId: "Variable", label: "Parent0", value: "parent0"
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes,
      dropdown
    });
    const expected: VariableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: NOTHING
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns location data: identifier", () => {
    const dropdown = ({
      headingId: "Variable", label: "Parent0", value: "parent0"
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.identifier,
      dropdown
    });
    const expected: VariableNode = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: {
          kind: "identifier",
          args: {
            label: "parent0"
          }
        }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns variable: numeric", () => {
    const dropdown = ({
      headingId: "Variable", label: "Label0", value: "label0"
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Number,
    });
    const expected: VariableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label",
        default_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns variable: text", () => {
    const dropdown = ({
      headingId: "Variable", label: "Label0", value: "label0"
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Text,
    });
    const expected: VariableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label",
        default_value: { kind: "text", args: { string: "" } }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns new variable: numeric", () => {
    const dropdown = ({
      headingId: "Numeric", label: "Label0", value: "label0"
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Number,
    });
    const expected: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: { kind: "numeric", args: { number: expect.any(Number) } }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns new variable: text", () => {
    const dropdown = ({
      headingId: "Text", label: "Label0", value: "label0"
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Text,
    });
    const expected: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: { kind: "text", args: { string: expect.any(String) } }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns new variable: resource", () => {
    const dropdown = ({
      headingId: "Resource", label: "Label0", value: "Sequence"
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Resource,
    });
    const expected: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: {
          kind: "resource_placeholder", args: {
            resource_type: "Sequence"
          }
        }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns new variable: sequence", () => {
    const dropdown = ({
      headingId: "Sequence", label: "Label0", value: 1
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Resource,
    });
    const expected: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Sequence",
          }
        }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns new variable: peripheral", () => {
    const dropdown = ({
      headingId: "Peripheral", label: "Label0", value: 1
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Resource,
    });
    const expected: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Peripheral",
          }
        }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns new variable: sensor", () => {
    const dropdown = ({
      headingId: "Sensor", label: "Label0", value: 1
    });
    const variable = convertDDItoVariable({
      identifierLabel: "label",
      allowedVariableNodes: AllowedVariableNodes.parameter,
      dropdown,
      variableType: VariableType.Resource,
    });
    const expected: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: {
          kind: "resource", args: {
            resource_id: 1,
            resource_type: "Sensor",
          }
        }
      }
    };
    expect(variable).toEqual(expected);
  });
});

describe("addOrEditBodyVariables()", () => {
  it("filters variables", () => {
    const parameterDeclaration: VariableNode = {
      kind: "parameter_declaration",
      args: { label: "label", default_value: NOTHING },
    };
    const parameterApplication: VariableNode = {
      kind: "parameter_application",
      args: { label: "label", data_value: NOTHING },
    };
    const variables = [parameterDeclaration, parameterApplication];
    const item = parameterDeclaration;
    expect(addOrEditBodyVariables(variables, item, "label"))
      .toEqual([parameterDeclaration]);
  });
});
