import React from "react";
import { mount } from "enzyme";
import { VariableNode, VariableType } from "../locals_list_support";
import {
  determineVariableType,
  newVariableDataValue, newVariableLabel, VariableIcon, VariableIconProps,
} from "../new_variable";
import { NOTHING_SELECTED } from "../handle_select";

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
});

describe("newVariableDataValue()", () => {
  it("returns location data value", () => {
    expect(newVariableDataValue(VariableType.Location)).toEqual(NOTHING_SELECTED);
  });

  it("returns number data value", () => {
    expect(newVariableDataValue(VariableType.Number))
      .toEqual({ kind: "numeric", args: { number: 0 } });
  });

  it("returns text data value", () => {
    expect(newVariableDataValue(VariableType.Text))
      .toEqual({ kind: "text", args: { string: "" } });
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
});
