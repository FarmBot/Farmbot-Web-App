import { createSequenceMeta } from "../sequence_meta";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { sanitizeNodes } from "../../sequences/step_tiles/tile_move_absolute/variables_support";

describe("createSequenceMeta", () => {
  it("indexes relevant meta-data relating to variables", () => {
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
    const ri = buildResourceIndex([]);
    const result = createSequenceMeta(ri.index, s);
    const { parent } = result;
    expect(parent).toBeTruthy();
    if (parent) {
      expect(parent.celeryNode.args.label).toEqual("parent");
      expect(parent.dropdown.label).toEqual("Coordinate (0, 0, 0)");
      expect(parent.editable).toBe(true);
      expect(parent.location).toEqual({ x: 0, y: 0, z: 0 });
      expect(parent.variableValue.kind).toBe("coordinate");
    }
  });
});
