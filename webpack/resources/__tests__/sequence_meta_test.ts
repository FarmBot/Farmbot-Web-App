import {
  createSequenceMeta,
  determineDropdown,
  findVariableByName
} from "../sequence_meta";
import {
  fakeSequence,
  fakePoint
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  sanitizeNodes
} from "../../sequences/step_tiles/tile_move_absolute/variables_support";
import {
  formatPoint
} from "../../sequences/step_tiles/tile_move_absolute/generate_list";

describe("determineDropdown", () => {
  it("Returns a label for `parameter_declarations`", () => {
    const r = determineDropdown({
      kind: "parameter_declaration",
      args: { label: "x", data_type: "tool" }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("X");
    expect(r.value).toBe("?");
  });

  it("Returns a label for `coordinate`", () => {
    const r = determineDropdown({
      kind: "variable_declaration",
      args: {
        label: "x",
        data_value: { kind: "coordinate", args: { x: 0, y: 1, z: 2 } }
      }
    }, buildResourceIndex([]).index);
    expect(r.label).toBe("Coordinate (0, 1, 2)");
    expect(r.value).toBe("?");
  });
});

it("Returns a label for `identifier`", () => {
  const r = determineDropdown({
    kind: "variable_declaration",
    args: {
      label: "x",
      data_value: { kind: "identifier", args: { label: "parent1" } }
    }
  }, buildResourceIndex([]).index);
  expect(r.label).toBe("Parent1");
  expect(r.value).toBe("?");
});

it("Returns a label for `point`", () => {
  const point = fakePoint();
  const r = determineDropdown({
    kind: "variable_declaration",
    args: {
      label: "x",
      data_value: {
        kind: "point",
        args: {
          pointer_id: point.body.id || -0,
          pointer_type: "Point"
        }
      }
    }
  }, buildResourceIndex([point]).index);
  expect(r.label).toBe(formatPoint(point).label);
  expect(r.value).toBe("" + point.body.id);
});

describe("createSequenceMeta", () => {
  const s = fakeSequence();
  s.body.body = [{ // <= Add var. reference
    kind: "move_absolute",
    args: {
      location: { kind: "identifier", args: { label: "parent" } },
      offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      speed: 0
    }
  }];
  s.body = sanitizeNodes(s.body).thisSequence; // <= Add missing declaration
  const ri = buildResourceIndex([s]);

  it("indexes relevant meta-data relating to variables", () => {
    const result = createSequenceMeta(ri.index, s);
    const { parent } = result;
    const extracted = findVariableByName(ri.index, s.uuid, "parent");
    expect(parent).toBeTruthy();
    if (parent && extracted) {
      expect(parent.celeryNode.args.label).toEqual("parent");
      expect(parent.dropdown.label).toEqual("Coordinate (0, 0, 0)");
      expect(parent.vector).toEqual({ x: 0, y: 0, z: 0 });
      expect(extracted.celeryNode.args.label).toEqual("parent");
      expect(extracted.dropdown.label).toEqual("Coordinate (0, 0, 0)");
      expect(extracted.vector).toEqual({ x: 0, y: 0, z: 0 });
    }
  });
});
