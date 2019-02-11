import { localListCallback } from "../locals_list";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { inputEvent } from "../../../__test_support__/fake_input_event";
import { VariableDeclaration, ScopeDeclarationBodyItem } from "farmbot";
import { AxisEditProps, manuallyEditAxis } from "../location_form";

describe("localListCallback", () => {
  it("handles a new local declaration", () => {
    const sequence = fakeSequence();
    const dispatch = jest.fn();
    const cb = localListCallback({ sequence, dispatch });
    cb([
      {
        kind: "parameter_declaration",
        args: { label: "parent", data_type: "coordinate" }
      },
      {
        kind: "variable_declaration",
        args: {
          label: "foo",
          data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
        }
      }
    ])({
      kind: "variable_declaration",
      args: {
        label: "foo",
        data_value: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } }
      }
    });
    const action = expect.objectContaining({ type: "OVERWRITE_RESOURCE" });
    expect(dispatch)
      .toHaveBeenCalledWith(action);
    expect(dispatch)
      .toHaveBeenCalledWith(expect.objectContaining({
        payload: expect.objectContaining({ uuid: sequence.uuid })
      }));
  });
});

const isVariableDeclaration =
  (x: ScopeDeclarationBodyItem): x is VariableDeclaration =>
    x.kind === "variable_declaration";

describe("manuallyEditAxis()", () => {
  const fakeProps = (): AxisEditProps => ({
    axis: "x",
    onChange: jest.fn(),
    declaration: {
      kind: "variable_declaration",
      args: {
        label: "parent",
        data_value: { kind: "coordinate", args: { x: 10, y: 20, z: 30 } }
      }
    },
  });

  it("edits an axis", () => {
    const expected = fakeProps();
    if (isVariableDeclaration(expected.declaration) &&
      expected.declaration.args.data_value.kind === "coordinate") {
      expected.declaration.args.data_value.args.x = 1.23;
    }
    const p = fakeProps();
    manuallyEditAxis(p)(inputEvent("1.23"));
    expect(p.onChange).toHaveBeenCalledWith(expected.declaration);
  });

  it("can't edit when not a coordinate (inputs also disabled)", () => {
    const p = fakeProps();
    p.declaration.args = {
      label: "", data_value: {
        kind: "identifier", args: { label: "" }
      }
    };
    manuallyEditAxis(p)(inputEvent("1.23"));
    expect(p.onChange).not.toHaveBeenCalled();
  });
});
