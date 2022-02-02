import React from "react";
import { mount } from "enzyme";
import { VariableNode, VariableType } from "../locals_list_support";
import {
  determineVariableType,
  newVariableDataValue, newVariableLabel, VariableIcon, VariableIconProps,
  varTypeFromLabel,
} from "../new_variable";

describe("newVariableLabel()", () => {
  it("returns location label", () => {
    expect(newVariableLabel(VariableType.Location)(1)).toEqual("Location 1");
  });

  it("returns number label", () => {
    expect(newVariableLabel(VariableType.Number)(1)).toEqual("Number 1");
  });

  it("returns text label", () => {
    expect(newVariableLabel(VariableType.Text)(1)).toEqual("Text 1");
  });

  it("returns resource label", () => {
    expect(newVariableLabel(VariableType.Resource)(1)).toEqual("Resource 1");
  });
});

describe("varTypeFromLabel()", () => {
  it("returns type", () => {
    expect(varTypeFromLabel("Location 1")).toEqual(VariableType.Location);
    expect(varTypeFromLabel("Number 1")).toEqual(VariableType.Number);
    expect(varTypeFromLabel("Text 1")).toEqual(VariableType.Text);
    expect(varTypeFromLabel("Resource 1")).toEqual(VariableType.Resource);
  });
});

describe("newVariableDataValue()", () => {
  it("returns location data value", () => {
    expect(newVariableDataValue(VariableType.Location))
      .toEqual({ kind: "nothing", args: {} });
  });

  it("returns number data value", () => {
    expect(newVariableDataValue(VariableType.Number))
      .toEqual({ kind: "numeric", args: { number: 0 } });
  });

  it("returns text data value", () => {
    expect(newVariableDataValue(VariableType.Text))
      .toEqual({ kind: "text", args: { string: "" } });
  });

  it("returns resource data value", () => {
    expect(newVariableDataValue(VariableType.Resource))
      .toEqual({
        kind: "resource_placeholder",
        args: { resource_type: "Sequence" },
      });
  });
});

describe("determineVariableType()", () => {
  it("returns location", () => {
    const variable: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };
    expect(determineVariableType(variable)).toEqual(VariableType.Location);
  });

  it("returns number", () => {
    const variable: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    expect(determineVariableType(variable)).toEqual(VariableType.Number);
  });

  it("returns text", () => {
    const variable: VariableNode = {
      kind: "variable_declaration",
      args: {
        label: "label",
        data_value: { kind: "text", args: { string: "" } }
      }
    };
    expect(determineVariableType(variable)).toEqual(VariableType.Text);
  });

  it("returns resource", () => {
    const variable: VariableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label",
        default_value: {
          kind: "resource_placeholder",
          args: { resource_type: "Sequence" },
        }
      }
    };
    expect(determineVariableType(variable)).toEqual(VariableType.Resource);
  });
});

describe("<VariableIcon />", () => {
  const fakeProps = (): VariableIconProps => ({
    variableType: VariableType.Location,
  });

  it("renders location icon", () => {
    const wrapper = mount(<VariableIcon {...fakeProps()} />);
    expect(wrapper.find("i").hasClass("fa-crosshairs")).toBeTruthy();
  });

  it("renders numeric icon", () => {
    const p = fakeProps();
    p.variableType = VariableType.Number;
    const wrapper = mount(<VariableIcon {...p} />);
    expect(wrapper.find("i").hasClass("fa-hashtag")).toBeTruthy();
  });

  it("renders text icon", () => {
    const p = fakeProps();
    p.variableType = VariableType.Text;
    const wrapper = mount(<VariableIcon {...p} />);
    expect(wrapper.find("i").hasClass("fa-font")).toBeTruthy();
  });

  it("renders resource icon", () => {
    const p = fakeProps();
    p.variableType = VariableType.Resource;
    const wrapper = mount(<VariableIcon {...p} />);
    expect(wrapper.find("i").hasClass("fa-hdd-o")).toBeTruthy();
  });
});
