import React from "react";
import { mount, shallow } from "enzyme";
import { DefaultValueFormProps, DefaultValueForm } from "../default_value_form";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { Coordinate, ParameterApplication } from "farmbot";
import { VariableForm } from "../variable_form";
import { changeBlurableInput } from "../../../__test_support__/helpers";

describe("<DefaultValueForm />", () => {
  const COORDINATE: Coordinate =
    ({ kind: "coordinate", args: { x: 1, y: 2, z: 3 } });

  const fakeProps = (): DefaultValueFormProps => ({
    variableNode: {
      kind: "parameter_declaration",
      args: { label: "label", default_value: COORDINATE }
    },
    resources: buildResourceIndex().index,
    onChange: jest.fn(),
  });

  it("renders default value", () => {
    const wrapper = mount(<DefaultValueForm {...fakeProps()} />);
    expect(wrapper.text()).toContain("Coordinate (1, 2, 3)");
  });

  it("doesn't render default value when not a ParameterDeclaration", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "parameter_application",
      args: { label: "label", data_value: COORDINATE }
    };
    const wrapper = mount(<DefaultValueForm {...p} />);
    expect(wrapper.text()).not.toContain("Coordinate (1, 2, 3)");
  });

  it("updates default value", () => {
    const p = fakeProps();
    const wrapper = mount(<DefaultValueForm {...p} />);
    changeBlurableInput(wrapper, "1", 0);
    expect(p.onChange).toHaveBeenCalledWith(p.variableNode, "label");
  });

  it("updates with coordinate", () => {
    const p = fakeProps();
    const wrapper = shallow(<DefaultValueForm {...p} />);
    const pa: ParameterApplication = {
      kind: "parameter_application",
      args: { label: "label", data_value: COORDINATE },
    };
    wrapper.find(VariableForm).simulate("change", pa);
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: { label: "label", default_value: COORDINATE }
    }, "label");
  });

  it("doesn't update with point_groups", () => {
    const p = fakeProps();
    const wrapper = shallow(<DefaultValueForm {...p} />);
    const pa: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "point_group", args: { point_group_id: 1 }
        }
      }
    };
    wrapper.find(VariableForm).simulate("change", pa);
    expect(p.onChange).not.toHaveBeenCalled();
  });
});
