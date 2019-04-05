import { localListCallback } from "../locals_list";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { inputEvent } from "../../../__test_support__/fake_input_event";
import { ParameterApplication, ParameterDeclaration, VariableDeclaration } from "farmbot";
import { AxisEditProps, manuallyEditAxis } from "../location_form";
import { VariableNode } from "../locals_list_support";

describe("localListCallback", () => {
  it("handles a new local declaration", () => {
    const sequence = fakeSequence();
    const dispatch = jest.fn();
    const cb = localListCallback({ sequence, dispatch });
    const parameterDeclaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "parent", default_value: {
          kind: "coordinate", args: { x: 1, y: 2, z: 3 }
        }
      }
    };
    const variableDeclaration: VariableDeclaration = {
      kind: "variable_declaration",
      args: {
        label: "foo",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };
    cb([parameterDeclaration, variableDeclaration])({
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

const isParameterApplication =
  (x: VariableNode): x is ParameterApplication =>
    x.kind === "parameter_application";

describe("manuallyEditAxis()", () => {
  const fakeProps = (): AxisEditProps => ({
    axis: "x",
    onChange: jest.fn(),
    editableVariable: {
      kind: "parameter_application",
      args: {
        label: "parent",
        data_value: { kind: "coordinate", args: { x: 10, y: 20, z: 30 } }
      }
    },
  });

  it("edits an axis", () => {
    const expected = fakeProps();
    if (isParameterApplication(expected.editableVariable) &&
      expected.editableVariable.args.data_value.kind === "coordinate") {
      expected.editableVariable.args.data_value.args.x = 1.23;
    }
    const p = fakeProps();
    manuallyEditAxis(p)(inputEvent("1.23"));
    expect(p.onChange).toHaveBeenCalledWith(expected.editableVariable);
  });

  it("can't edit when not a coordinate (inputs also disabled)", () => {
    const p = fakeProps();
    p.editableVariable.args = {
      label: "", data_value: {
        kind: "identifier", args: { label: "" }
      }
    };
    manuallyEditAxis(p)(inputEvent("1.23"));
    expect(p.onChange).not.toHaveBeenCalled();
  });
});
