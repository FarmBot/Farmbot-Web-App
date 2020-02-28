import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { MoveAbsolute } from "farmbot";
import { sanitizeNodes } from "../sanitize_nodes";
import { get } from "lodash";

describe("performAllIndexesOnSequence", () => {
  const move_abs: MoveAbsolute = {
    kind: "move_absolute",
    args: {
      location: { kind: "identifier", args: { label: "parent" } },
      offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      speed: 800
    }
  };

  it("removes unused variables", () => {
    const unusedVar = fakeSequence().body;
    expect(unusedVar.args.locals.body).toBeUndefined();
    unusedVar.body = [];
    unusedVar.args.locals = {
      kind: "scope_declaration",
      args: {},
      body: [
        {
          kind: "parameter_declaration",
          args: {
            default_value: {
              kind: "coordinate", args: { x: 0, y: 0, z: 0 }
            }, label: "parent"
          }
        },
      ]
    };
    const result = sanitizeNodes(unusedVar);
    const locals = result.thisSequence.args.locals.body;
    if (locals) {
      expect(locals[0]).not.toBeDefined();
    } else {
      fail("Expected sanitizeNodes to set body to []");
    }
  });

  it("handles missing parameters / variables", () => {
    const missing_declaration = fakeSequence().body;
    expect(missing_declaration.args.locals.body).toBeUndefined();
    missing_declaration.body = [move_abs];
    missing_declaration.args.locals = {
      kind: "scope_declaration",
      args: {},
      body: []
    };
    sanitizeNodes(missing_declaration);
    const locals = missing_declaration.args.locals.body;
    if (locals) {
      expect(locals[0]).toBeDefined();
      expect(get(locals[0], "uuid")).toBeDefined();
      expect(locals[0].args.label).toEqual("parent");
    } else {
      fail("Expected performAllIndexesOnSequence to fill in missing declarations");
    }
  });
});
