import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { TaggedSequence } from "farmbot";
import { isParameterized } from "../is_parameterized";

type Sequence = TaggedSequence["body"];
type Locals = Sequence["args"]["locals"]["body"];

describe("isParameterized()", () => {

  function sequence(decl: Locals): Sequence {
    const { body } = fakeSequence();
    body.args.locals.body = decl;
    return body;
  }

  it("returns true when there are parameters", () => {
    const hasParent = sequence([
      {
        kind: "parameter_declaration",
        args: {
          label: "parent",
          default_value: {
            kind: "coordinate", args: { x: 0, y: 0, z: 0 }
          }
        }
      },
    ]);
    expect(isParameterized(hasParent)).toBeTruthy();
  });

  it("returns false when there are no parameters", () => {
    expect(isParameterized(sequence(undefined))).toBeFalsy();
    expect(isParameterized(sequence([]))).toBeFalsy();
  });
});
