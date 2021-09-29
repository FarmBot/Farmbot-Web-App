import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { MoveAbsolute } from "farmbot";
import { sanitizeNodes, variableIsInUse } from "../sanitize_nodes";
import { get } from "lodash";

describe("performAllIndexesOnSequence", () => {
  const move_abs: MoveAbsolute = {
    kind: "move_absolute",
    args: {
      location: { kind: "identifier", args: { label: "label" } },
      offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      speed: 800
    }
  };

  it("doesn't remove unused variables", () => {
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
            }, label: "label"
          }
        },
      ]
    };
    const result = sanitizeNodes(unusedVar);
    const locals = result.thisSequence.args.locals.body;
    expect(locals).toEqual(unusedVar.args.locals.body);
    expect(locals?.[0]).toBeDefined();
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
    expect(locals?.[0]).toBeDefined();
    expect(get(locals?.[0], "uuid")).toBeDefined();
    expect(locals?.[0].args.label).toEqual("label");
  });
});

describe("variableIsInUse()", () => {
  it("returns status: in use", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "identifier", args: { label: "label" } },
          },
        }],
    }];
    expect(variableIsInUse(sequence.body, "label")).toEqual(true);
  });

  it("returns status: not in use", () => {
    const sequence = fakeSequence();
    sequence.body.body = [];
    expect(variableIsInUse(sequence.body, "label")).toEqual(false);
  });
});
