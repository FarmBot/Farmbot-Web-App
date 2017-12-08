import { extractParent, handleVariableChange, setParent } from "../locals_list";
import { VariableDeclaration, ParameterDeclaration, Tool, Point, Coordinate } from "farmbot";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { overwrite } from "../../api/crud";

const coord: Coordinate = { kind: "coordinate", args: { x: 0, y: 0, z: 0 } };

describe("extractParent()", () => {
  const irrelevant: VariableDeclaration = {
    kind: "variable_declaration",
    args: { label: "nope", data_value: coord }
  };

  const bad: ParameterDeclaration = {
    kind: "parameter_declaration",
    args: { label: "parent", data_type: "coordinate" }
  };

  const good: VariableDeclaration = {
    kind: "variable_declaration",
    args: { label: "parent", data_value: coord }
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
    const result = extractParent([bad, good, irrelevant]);
    expect(result).toBeTruthy();
    if (result) {
      expect(result.kind).toBe("variable_declaration");
      expect(result.args.label).toBe("parent");
    }
  });
});

describe("setParent()", () => {
  const dispatch = jest.fn();
  const tool: Tool = { kind: "tool", args: { tool_id: 4 } };
  const point: Point = {
    kind: "point",
    args: { pointer_type: "point", pointer_id: 5 }
  };

  it("crashes on `identifier` nodes (no re-binding of vars yet)", () => {
    const seq = fakeSequence();
    const cb = () =>
      setParent(seq, { kind: "identifier", args: { label: "foo" } });
    expect(cb).toThrow();
  });

  it("sets tools, points and coordinates as new `parent` var", () => {
    const seq = fakeSequence();
    [tool, point, coord].map(item => {
      const result = setParent(seq, item).args.locals.body || [];
      expect(result.length).toEqual(1);
      const parent = result[0];
      expect(parent.args.label).toEqual("parent");
      expect(parent.kind).toEqual("variable_declaration");
      (parent.kind === "variable_declaration") &&
        expect(parent.args.data_value).toBe(item);
    });
  });
});

describe("handleVariableChange()", () => {
  it("calls dispatch() correctly", () => {
    const dispatch = jest.fn();
    const seq = fakeSequence();
    const cb = handleVariableChange(dispatch, seq);
    cb(coord);
    expect(dispatch)
      .toHaveBeenCalledWith(overwrite(seq, setParent(seq, coord)));
  });
});
