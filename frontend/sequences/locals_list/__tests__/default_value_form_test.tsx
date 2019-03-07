import * as React from "react";
import { mount } from "enzyme";
import { DefaultValueFormProps, DefaultValueForm } from "../default_value_form";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { Coordinate } from "farmbot";

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
    wrapper.find("input").first().simulate("change");
    wrapper.find("input").first().simulate("blur");
    expect(p.onChange).toHaveBeenCalledWith(p.variableNode);
  });
});
