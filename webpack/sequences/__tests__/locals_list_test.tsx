import * as React from "react";
import {
  extractParent,
  handleVariableChange,
  setParent,
  changeAxis,
  guessFromDataType,
  guessVecFromLabel,
  guessXYZ,
  ParentVariableFormProps,
  ParentVariableForm,
  LocalsListProps,
  LocalsList,
  PARENT
} from "../locals_list";
import {
  VariableDeclaration,
  ParameterDeclaration,
  Tool,
  Point,
  Coordinate
} from "farmbot";
import { fakeSequence, fakeTool } from "../../__test_support__/fake_state/resources";
import { overwrite } from "../../api/crud";
import { defensiveClone } from "../../util";
import { shallow } from "enzyme";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { FBSelect } from "../../ui/index";
import {
  InputBox, generateList, handleSelect
} from "../step_tiles/tile_move_absolute/index";

const coord: Coordinate = { kind: "coordinate", args: { x: 1, y: 2, z: 3 } };
const t = fakeTool();
t.body.id = 5;
const tool: Tool = { kind: "tool", args: { tool_id: t.body.id } };
const resources = buildResourceIndex([t]).index;
const mrGoodVar: VariableDeclaration = {
  // https://en.wikipedia.org/wiki/Mr._Goodbar
  kind: "variable_declaration",
  args: { label: "parent", data_value: coord }
};

describe("extractParent()", () => {
  const irrelevant: VariableDeclaration = {
    kind: "variable_declaration",
    args: { label: "nope", data_value: coord }
  };

  const paramDeclr: ParameterDeclaration = {
    kind: "parameter_declaration",
    args: { label: "parent", data_type: "coordinate" }
  };

  it("returns undefined on empty arrays", () => {
    expect(extractParent([])).toBeUndefined();
    expect(extractParent()).toBeUndefined();
  });

  it("returns undefined on arrays that don't have a parent", () => {
    expect(extractParent([irrelevant])).toBeUndefined();
  });

  it("returns parent if it is a PARAMETER declaration.", () => {
    const result = extractParent([paramDeclr]);
    expect(result).toBeDefined();
    expect(result).toBe(paramDeclr);
  });

  it("returns the first result found", () => {
    const paramIsFirst = [paramDeclr, mrGoodVar, irrelevant];
    const r1 = extractParent(paramIsFirst);
    if (r1) {
      expect(r1.kind).toBe("parameter_declaration");
      expect(r1.args.label).toBe("parent");
    } else {
      fail();
    }

    const varIsFirst = [irrelevant, mrGoodVar, paramDeclr];
    const r2 = extractParent(varIsFirst);
    if (r2) {
      expect(r2.kind).toBe("variable_declaration");
      expect(r2.args.label).toBe("parent");
    } else {
      fail();
    }
  });
});

describe("setParent()", () => {
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
      "Tool_1512679072 ",
      "Tool"
    ].map(bad => {
      expect(guessVecFromLabel(bad)).toBeUndefined();
    });
  });
  it("returns vec3 on well formed strings", () => {
    [
      {
        string: "Point_1512679072 (20, 50, 0)",
        expectation: { x: 20, y: 50, z: 0 }
      },
      {
        string: "carrot (360, 290, 0)",
        expectation: { x: 360, y: 290, z: 0 }
      },
      {
        string: "Safe-Remove Weed (633, 450, 0)",
        expectation: { x: 633, y: 450, z: 0 }
      },
      {
        string: "Point_1512679072 (0, 100, 0)",
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

describe("guessXYZ", () => {
  it("Gives labels precedence", () => {
    const result = guessXYZ("Point_1512679072 (20, 50, 0)",
      mrGoodVar,
      resources);
    expect(result.x).toEqual(20);
    expect(result.y).toEqual(50);
    expect(result.z).toEqual(0);
  });

  it("Gives labels precedence", () => {
    const result =
      guessXYZ("None",
        mrGoodVar,
        resources);
    const target = mrGoodVar.args.data_value;
    if (target.kind === "coordinate") {
      expect(result.x).toEqual(target.args.x);
      expect(result.y).toEqual(target.args.y);
      expect(result.z).toEqual(target.args.z);
    } else {
      fail();
    }
  });

  it("falls back to 0,0,0 on all other cases", () => {
    const result = guessXYZ("None", {
      kind: "variable_declaration",
      args: { label: "parent", data_value: tool }
    },
      resources);
    expect(Object.values(result)).toEqual([0, 0, 0]);
  });
});

describe("<ParentVariableForm/>", () => {
  it("renders correct UI components", () => {
    const props: ParentVariableFormProps = {
      parent: mrGoodVar,
      resources: buildResourceIndex().index,
      onChange: jest.fn()
    };

    const el = shallow(<ParentVariableForm {...props} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(InputBox);

    expect(selects.length).toBe(1);
    const p = selects.first().props();
    expect(p.allowEmpty).toBe(true);
    const choices = generateList(props.resources, [PARENT]);
    expect(p.list).toEqual(choices);
    const choice = choices[1];
    p.onChange(choice);
    expect(props.onChange)
      .toHaveBeenCalledWith(handleSelect(props.resources, choice));
    expect(inputs.length).toBe(3);
  });
});

describe("<LocalsList/>", () => {
  const props: LocalsListProps = {
    sequence: fakeSequence(),
    resources: buildResourceIndex().index,
    dispatch: jest.fn()
  };

  it("renders nothing", () => {
    props.sequence.body.args.locals = { kind: "scope_declaration", args: {} };
    const el = shallow(<LocalsList {...props} />);
    expect(el.find(ParentVariableForm).length).toBe(0);
  });

  it("renders something", () => {
    props.sequence.body.args.locals = {
      kind: "scope_declaration",
      args: {},
      body: [mrGoodVar]
    };
    const el = shallow(<LocalsList {...props} />);
    expect(el.find(ParentVariableForm).length).toBe(1);
  });
});
