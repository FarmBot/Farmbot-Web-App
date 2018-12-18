import {
  createSequenceMeta,
  extractParent,
  convertDdiToCelery,
  determineDropdown
} from "../sequence_meta";
import {
  fakeSequence,
  fakePlant,
  fakeTool,
  fakePoint
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { sanitizeNodes } from "../../sequences/step_tiles/tile_move_absolute/variables_support";
import { DropDownItem } from "../../ui/fb_select";
import { bail } from "../../util";
import { formatPoint } from "../../sequences/step_tiles/tile_move_absolute/generate_list";

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

describe("convertDdiToCelery", () => {
  it("Converts a celery Plant to a TaggedPlant", () => {
    const sequence = fakeSequence();
    const point = fakePlant();
    const i = buildResourceIndex([point, sequence]);
    const ddi: DropDownItem =
      ({
        value: "" + point.body.id || bail("BAD"),
        label: "",
        headingId: "Plant"
      });
    const result =
      convertDdiToCelery(i.index, ddi, sequence.uuid);
    expect(result.kind).toBe("Point");
    (result.kind == "Point") && expect(result.uuid).toBe(point.uuid);
  });

  it("Converts a celery Tool to a TaggedTool", () => {
    const sequence = fakeSequence();
    const tool = fakeTool();
    tool.body.id = 90000;
    const i = buildResourceIndex([tool, sequence]);
    const ddi: DropDownItem =
      ({
        value: "" + tool.body.id || bail("BAD"),
        label: "",
        headingId: "Tool"
      });
    const result =
      convertDdiToCelery(i.index, ddi, sequence.uuid);
    expect(result.kind).toBe("Tool");
    (result.kind == "Tool") && expect(result.uuid).toBe(tool.uuid);
  });
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
    const extracted = extractParent(ri.index, s.uuid);
    expect(parent).toBeTruthy();
    if (parent && extracted) {
      expect(parent.celeryNode.args.label).toEqual("parent");
      expect(parent.dropdown.label).toEqual("Coordinate (0, 0, 0)");
      expect(parent.editable).toBe(true);
      expect(parent.location).toEqual({ x: 0, y: 0, z: 0 });
      expect(parent.variableValue.kind).toBe("coordinate");
      expect(extracted.celeryNode.args.label).toEqual("parent");
      expect(extracted.dropdown.label).toEqual("Coordinate (0, 0, 0)");
      expect(extracted.editable).toBe(true);
      expect(extracted.location).toEqual({ x: 0, y: 0, z: 0 });
      expect(extracted.variableValue.kind).toBe("coordinate");
      const ddi = { label: "parent", value: "parent", headingId: "identifier" };
      const celery = convertDdiToCelery(ri.index, ddi, s.uuid);
      expect(celery.kind).toBe("BoundVariable");
    }
  });
});
