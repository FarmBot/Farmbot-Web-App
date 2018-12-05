import { localListCallback } from "../locals_list";
import { fakeSequence } from "../../__test_support__/fake_state/resources";

describe("localListCallback", () => {
  it("handles a new local declaration", () => {
    const sequence = fakeSequence();
    const dispatch = jest.fn();
    const cb = localListCallback({ sequence, dispatch });
    cb({
      kind: "scope_declaration",
      args: {},
      body: [
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
      ]
    });
    expect(dispatch)
      .toHaveBeenCalledWith(expect.objectContaining({ type: "EDIT_RESOURCE" }));
    expect(dispatch)
      .toHaveBeenCalledWith(expect.objectContaining({
        payload: expect.objectContaining({ uuid: sequence.uuid })
      }));
  });
});
