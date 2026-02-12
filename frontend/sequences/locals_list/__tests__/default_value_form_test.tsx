import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { DefaultValueFormProps, DefaultValueForm } from "../default_value_form";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { Coordinate, ParameterApplication } from "farmbot";

let mockVariableFormOnChangeArg: ParameterApplication;

jest.mock("../variable_form", () => ({
  VariableForm: (props: {
    variable: { celeryNode: ParameterApplication };
    onChange: (value: ParameterApplication) => void;
  }) => {
    const value = props.variable.celeryNode.args.data_value;
    const text = value.kind === "coordinate"
      ? `Coordinate (${value.args.x}, ${value.args.y}, ${value.args.z})`
      : "";
    return <div>
      <span>{text}</span>
      <button className={"variable-form-change"}
        onClick={() => props.onChange(mockVariableFormOnChangeArg)} />
    </div>;
  },
}));

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
    const { container } = render(<DefaultValueForm {...fakeProps()} />);
    expect(container.textContent).toContain("Coordinate (1, 2, 3)");
  });

  it("doesn't render default value when not a ParameterDeclaration", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "parameter_application",
      args: { label: "label", data_value: COORDINATE }
    };
    const { container } = render(<DefaultValueForm {...p} />);
    expect(container.textContent).not.toContain("Coordinate (1, 2, 3)");
  });

  it("updates default value", () => {
    const p = fakeProps();
    mockVariableFormOnChangeArg = {
      kind: "parameter_application",
      args: { label: "label", data_value: COORDINATE },
    };
    const { container } = render(<DefaultValueForm {...p} />);
    fireEvent.click(container.querySelector(".variable-form-change") as Element);
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: { label: "label", default_value: COORDINATE }
    }, "label");
  });

  it("updates with coordinate", () => {
    const p = fakeProps();
    const pa: ParameterApplication = {
      kind: "parameter_application",
      args: { label: "label", data_value: COORDINATE },
    };
    mockVariableFormOnChangeArg = pa;
    const { container } = render(<DefaultValueForm {...p} />);
    fireEvent.click(container.querySelector(".variable-form-change") as Element);
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: { label: "label", default_value: COORDINATE }
    }, "label");
  });

  it("doesn't update with point_groups", () => {
    const p = fakeProps();
    mockVariableFormOnChangeArg = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "point_group", args: { point_group_id: 1 }
        }
      }
    };
    const { container } = render(<DefaultValueForm {...p} />);
    fireEvent.click(container.querySelector(".variable-form-change") as Element);
    expect(p.onChange).not.toHaveBeenCalled();
  });
});
