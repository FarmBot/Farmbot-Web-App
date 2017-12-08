import { extractParent, handleVariableChange, setParent, changeAxis, guessFromDataType, guessVecFromLabel } from "../locals_list";
import { VariableDeclaration, ParameterDeclaration, Tool, Point, Coordinate } from "farmbot";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { overwrite } from "../../api/crud";
import { defensiveClone } from "../../util";

const coord: Coordinate = { kind: "coordinate", args: { x: 0, y: 0, z: 0 } };
const tool: Tool = { kind: "tool", args: { tool_id: 4 } };

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

type E = React.SyntheticEvent<HTMLInputElement>;

describe("changeAxis()", () => {
  const onChange = jest.fn();

  it("is never not a coordinate", () => {
    const cb = changeAxis("x", onChange, tool);
    const fakeEvent = { currentTarget: { value: "23" } };
    const example =
      () => cb(fakeEvent as E);
    expect(example).toThrow();
  });

  it("handles coordinates", () => {
    const cb = changeAxis("x", onChange, coord);
    const fakeEvent = { currentTarget: { value: "23" } };
    const expectedCoord = defensiveClone(coord);
    expectedCoord.args.x = 23;
    cb(fakeEvent as E);
    expect(onChange).toHaveBeenCalledWith(expectedCoord);
  });
});

describe("guessFromDataType()", () => {
  it("returns undefined if not coord", () => {
    expect(guessFromDataType(tool)).toBe(undefined);
  });

  it("returns coord.args", () => {
    expect(guessFromDataType(coord)).toBe(coord.args);
  });
});

describe("guessVecFromLabel()", () => {
  it("returns undefined on malformed strings", () => {
    [
      "",
      "))((1,(),2,3)",
      "    ()()()",
      "Alphabetical (a, b, c)",
      "tool 1,2,3",
      "Something else (test123)",
      "Tool: Tool_1512679072 ",
      "Tool"
    ].map(bad => {
      expect(guessVecFromLabel(bad)).toBeUndefined();
    });
  });
  it("returns vec3 on well formed strings", () => {
    [
      {
        string: "Plant: Point_1512679072 (20, 50, 0)",
        expectation: { x: 20, y: 50, z: 0 }
      },
      {
        string: "Plant: carrot (360, 290, 0)",
        expectation: { x: 360, y: 290, z: 0 }
      },
      {
        string: "Map Point: Safe-Remove Weed (633, 450, 0)",
        expectation: { x: 633, y: 450, z: 0 }
      },
      {
        string: "Map Point: Point_1512679072 (0, 100, 0)",
        expectation: { x: 0, y: 100, z: 0 }
      }
    ].map(xmp => {
      const result = guessVecFromLabel(xmp.string);
      if (result) {
        expect(result.x).toBe(xmp.expectation.x);
        expect(result.y).toBe(xmp.expectation.y);
        expect(result.y).toBe(xmp.expectation.y);
      } else {
        fail("No result obtained.");
      }
    });
  });
});
