import { localListCallback } from "../locals_list";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { ParameterDeclaration, VariableDeclaration } from "farmbot";

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
