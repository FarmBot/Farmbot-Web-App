import { convertDDItoDeclaration } from "../handle_select";
import { ScopeDeclarationBodyItem, Point, Tool, Coordinate } from "farmbot";

const label = "parent";
const expectedVariable = (data_value: Point | Tool | Coordinate) =>
  ({ kind: "variable_declaration", args: { label, data_value } });

describe("convertDDItoDeclaration()", () => {
  it("returns location data: point", () => {
    const ddi =
      ({ headingId: "GenericPointer", label: "Point 1 (10, 20, 30)", value: 2 });
    const variable = convertDDItoDeclaration({ label })(ddi);
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
    const variable = convertDDItoDeclaration({ label })(ddi);
    expect(variable).toEqual(expectedVariable({
      kind: "tool", args: { tool_id: 1 }
    }));
  });

  it("returns location data: Plant", () => {
    const ddi = { headingId: "Plant", label: "Mint", value: 1 };
    const variable = convertDDItoDeclaration({ label })(ddi);
    expect(variable).toEqual(expectedVariable({
      kind: "point", args: { pointer_id: 1, pointer_type: "Plant" }
    }));
  });

  it("returns location data: default", () => {
    const variable = convertDDItoDeclaration({ label })({
      label: "None",
      value: "",
      isNull: true
    });
    expect(variable).toEqual(expectedVariable({
      kind: "coordinate", args: { x: 0, y: 0, z: 0 }
    }));
  });

  it("returns location data: parameter_declaration", () => {
    const ddi = ({ headingId: "parameter", label: "Parent0", value: "parent0" });
    const variable = convertDDItoDeclaration({ label: "parent" })(ddi);
    const expected: ScopeDeclarationBodyItem = {
      kind: "parameter_declaration",
      args: { data_type: "point", label: "parent" }
    };
    expect(variable).toEqual(expected);
  });

  it("returns location data: identifier", () => {
    const ddi = ({ headingId: "parameter", label: "Parent0", value: "parent0" });
    const variable = convertDDItoDeclaration({
      label: "parent", useIdentifier: true
    })(ddi);
    const expected: ScopeDeclarationBodyItem = {
      kind: "variable_declaration",
      args: {
        data_value: {
          kind: "identifier", args: { label: "parent0" }
        }, label: "parent"
      }
    };
    expect(variable).toEqual(expected);
  });
});
