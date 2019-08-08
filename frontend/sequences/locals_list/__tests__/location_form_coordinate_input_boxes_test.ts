import { inputEvent } from "../../../__test_support__/fake_input_event";
import { ParameterApplication } from "farmbot";
import {
  AxisEditProps, manuallyEditAxis
} from "../location_form_coordinate_input_boxes";
import { VariableNode } from "../locals_list_support";

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
