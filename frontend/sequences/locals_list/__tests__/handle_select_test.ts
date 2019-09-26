import { convertDDItoVariable, NOTHING_SELECTED } from "../handle_select";
import { Point, Tool, Coordinate } from "farmbot";
import { NO_VALUE_SELECTED_DDI, COORDINATE_DDI } from "../location_form_list";
import { VariableNode, AllowedVariableNodes } from "../locals_list_support";

const label = "parent";
const allowedVariableNodes = AllowedVariableNodes.variable;
const expectedVariable = (data_value: Point | Tool | Coordinate) =>
  ({ kind: "parameter_application", args: { label, data_value } });

describe("convertDDItoDeclaration()", () => {
  it("returns location data: point", () => {
    const ddi =
      ({ headingId: "GenericPointer", label: "Point 1 (10, 20, 30)", value: 2 });
    const variable = convertDDItoVariable({ label, allowedVariableNodes }, ddi);
    expect(variable).toEqual(expectedVariable({
      kind: "point",
      args: {
        pointer_id: 2,
        pointer_type: "GenericPointer"
      }
    }));
  });

  it("returns location data: tool", () => {
    const ddi = { headingId: "Tool", label: "Generic Tool", value: 1 };
    const variable = convertDDItoVariable({ label, allowedVariableNodes }, ddi);
    expect(variable).toEqual(expectedVariable({
      kind: "tool", args: { tool_id: 1 }
    }));
  });

  it("returns location data: Plant", () => {
    const ddi = { headingId: "Plant", label: "Mint", value: 1 };
    const variable = convertDDItoVariable({ label, allowedVariableNodes }, ddi);
    expect(variable).toEqual(expectedVariable({
      kind: "point", args: { pointer_id: 1, pointer_type: "Plant" }
    }));
  });

  it("returns location data: default", () => {
    const variable = convertDDItoVariable({
      label, allowedVariableNodes
    }, NO_VALUE_SELECTED_DDI());
    expect(variable).toEqual(expectedVariable(NOTHING_SELECTED));
  });

  it("returns variable declaration: default", () => {
    const expected = expectedVariable(NOTHING_SELECTED);
    expected.kind = "variable_declaration";
    const variable = convertDDItoVariable({
      label, allowedVariableNodes: AllowedVariableNodes.parameter
    }, NO_VALUE_SELECTED_DDI());
    expect(variable).toEqual(expected);
  });

  it("returns location data: coordinate", () => {
    const variable = convertDDItoVariable({
      label, allowedVariableNodes
    }, COORDINATE_DDI({ x: 1, y: 2, z: 3 }));
    expect(variable).toEqual(expectedVariable({
      kind: "coordinate", args: { x: 1, y: 2, z: 3 }
    }));
  });

  it("returns location data: new coordinate", () => {
    const variable = convertDDItoVariable({
      label, allowedVariableNodes
    }, COORDINATE_DDI());
    expect(variable).toEqual(expectedVariable({
      kind: "coordinate", args: { x: 0, y: 0, z: 0 }
    }));
  });

  it("returns location data: parameter_declaration", () => {
    const ddi = ({ headingId: "parameter", label: "Parent0", value: "parent0" });
    const variable = convertDDItoVariable({
      label: "parent", allowedVariableNodes
    }, ddi);
    const expected: VariableNode = {
      kind: "parameter_declaration",
      args: {
        label: "parent", default_value: NOTHING_SELECTED
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns location data: identifier", () => {
    const ddi = ({ headingId: "parameter", label: "Parent0", value: "parent0" });
    const variable = convertDDItoVariable({
      label: "parent", allowedVariableNodes: AllowedVariableNodes.identifier
    }, ddi);
    const expected: VariableNode = {
      kind: "parameter_application",
      args: {
        label: "parent",
        data_value: {
          kind: "identifier", args: { label: "parent0" }
        }
      }
    };
    expect(variable).toEqual(expected);
  });

  it("returns location data: every_point", () => {
    const ddi = ({ headingId: "every_point", label: "All Plants", value: "Plant" });
    const variable = convertDDItoVariable({
      label: "label", allowedVariableNodes
    }, ddi);
    const expected: VariableNode = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: {
          kind: "every_point", args: { every_point_type: "Plant" }
        }
      }
    };
    expect(variable).toEqual(expected);
  });
});
