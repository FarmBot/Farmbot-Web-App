import { extractParent } from "../locals_list";
import { VariableDeclaration, ParameterDeclaration } from "farmbot";

describe("extractParent()", () => {
  const irrelevant: VariableDeclaration = {
    kind: "variable_declaration",
    args: {
      label: "nope",
      data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
    }
  };

  const bad: ParameterDeclaration = {
    kind: "parameter_declaration",
    args: { label: "parent", data_type: "coordinate" }
  };

  const good: VariableDeclaration = {
    kind: "variable_declaration",
    args: {
      label: "parent",
      data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
    }
  };

  it("returns undefined on empty arrays", () => {
    expect(extractParent([])).toBeUndefined();
    expect(extractParent()).toBeUndefined();
  });

  it("returns undefined on arrays that don't have a parent", () => {
    expect(extractParent([irrelevant])).toBeUndefined();
  });

  it("only returns parent if it is a VARIABLE declaration.", () => {
    expect(extractParent([bad])).toBeUndefined();
  });

  it("returns parent when there is one", () => {
    const list = [bad, good, irrelevant];
    const q = extractParent;
    const result = extractParent(list);
    debugger;
    expect(result).toBeTruthy();
    if (result) {
      expect(result.kind).toBe("variable_declaration");
      expect(result.args.label).toBe("parent");
    }
  });
});
