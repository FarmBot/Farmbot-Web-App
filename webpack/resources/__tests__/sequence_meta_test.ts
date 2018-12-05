import { createSequenceMeta, extractParent, convertDdiToCelery } from "../sequence_meta";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { sanitizeNodes } from "../../sequences/step_tiles/tile_move_absolute/variables_support";

describe("convertDdiToCelery", () => {
  it("Converts a celery Plant to a TaggedPlant", () => {
    pending();
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
