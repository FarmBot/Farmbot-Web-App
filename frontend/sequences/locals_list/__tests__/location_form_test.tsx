let mockShouldDisplay = false;
jest.mock("../../../devices/should_display", () => ({
  shouldDisplayFeature: () => mockShouldDisplay,
}));

import React from "react";
import {
  LocationForm, NumericInput, NumericInputProps, VariableIcon, VariableIconProps,
} from "../location_form";
import {
  fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import { shallow, mount } from "enzyme";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { FBSelect, BlurableInput, Color } from "../../../ui";
import { LocationFormProps, AllowedVariableNodes } from "../locals_list_support";
import { difference } from "lodash";
import { locationFormList } from "../location_form_list";
import { convertDDItoVariable } from "../handle_select";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import { error } from "../../../toast/toast";
import { changeBlurableInput } from "../../../__test_support__/helpers";

describe("<LocationForm />", () => {
  const fakeProps = (): LocationFormProps => ({
    variable: {
      celeryNode: {
        kind: "parameter_declaration",
        args: {
          label: "label", default_value: {
            kind: "coordinate", args: { x: 0, y: 0, z: 0 }
          }
        }
      },
      dropdown: { label: "label", value: 0 },
      vector: { x: 0, y: 0, z: 0 }
    },
    sequenceUuid: fakeSequence().uuid,
    resources: buildResourceIndex().index,
    onChange: jest.fn(),
    allowedVariableNodes: AllowedVariableNodes.parameter,
    collapsible: true,
  });

  it("renders correct UI components", () => {
    const p = fakeProps();
    const el = shallow(<LocationForm {...p} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(BlurableInput);

    expect(selects.length).toBe(1);
    const select = selects.first().props();
    const choices = locationFormList(
      p.resources, [], [{ label: "Externally defined", value: "" }], true);
    const actualLabels = select.list.map(x => x.label).sort();
    const expectedLabels = choices.map(x => x.label).sort();
    const diff = difference(actualLabels, expectedLabels);
    expect(diff).toEqual([]);
    const dropdown = choices[1];
    select.onChange(dropdown);
    expect(p.onChange)
      .toHaveBeenCalledWith(convertDDItoVariable({
        identifierLabel: "label",
        allowedVariableNodes: p.allowedVariableNodes,
        dropdown
      }), "label");
    expect(inputs.length).toBe(0);
    expect(el.html()).not.toContain("fa-exclamation-triangle");
  });

  it("uses body variable data", () => {
    const p = fakeProps();
    p.bodyVariables = [{
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "identifier", args: { label: "new_var" }
        }
      }
    }];
    const wrapper = mount(<LocationForm {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("add new");
  });

  it("shows corrected variable label", () => {
    const p = fakeProps();
    p.variable.celeryNode.args.label = "parent";
    const wrapper = mount(<LocationForm {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("location variable");
    expect(wrapper.text().toLowerCase()).not.toContain("parent");
  });

  it("shows variable in dropdown", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    const variableNameSet = fakeVariableNameSet("parent");
    p.resources.sequenceMetas[p.sequenceUuid] = variableNameSet;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .toEqual(expect.arrayContaining([{
        headingId: "Variable",
        label: "Location variable - Select a location",
        value: "parent",
      }]));
  });

  it("doesn't show variable in dropdown", () => {
    const p = fakeProps();
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .not.toEqual(expect.arrayContaining([{
        headingId: "Variable",
        label: "label",
        value: "Location variable 1",
      }]));
  });

  it("shows correct variable label", () => {
    const p = fakeProps();
    p.variable.dropdown.label = "Externally defined";
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem).toEqual({
      label: "Externally defined", value: 0
    });
    expect(wrapper.find(FBSelect).first().props().list)
      .toEqual(expect.arrayContaining([{
        headingId: "Variable",
        label: "Externally defined",
        value: "label",
      }]));
  });

  it("shows add new variable option", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.variable.dropdown.isNull = true;
    const wrapper = shallow(<LocationForm {...p} />);
    const list = wrapper.find(FBSelect).first().props().list;
    const vars = list.filter(item =>
      item.headingId == "Variable" && !item.heading);
    expect(vars.length).toEqual(1);
    expect(vars[0].value).toEqual("Location variable 1");
    expect(vars[0].label).toEqual("Add new");
    expect(list).toEqual(expect.arrayContaining([{
      headingId: "Variable",
      label: "Add new",
      value: "Location variable 1",
    }]));
  });

  it("shows groups in dropdown", () => {
    const p = fakeProps();
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list).toContainEqual({
      headingId: "Coordinate",
      label: "Custom coordinates",
      value: ""
    });
  });

  it("uses custom filter for dropdown", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.customFilterRule = () => false;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list).toEqual([]);
  });

  it("renders collapse icon: open", () => {
    const p = fakeProps();
    p.collapsible = true;
    p.collapsed = false;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.html()).toContain("fa-caret-up");
  });

  it("renders collapse icon: closed", () => {
    const p = fakeProps();
    p.collapsible = true;
    p.collapsed = true;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.html()).toContain("fa-caret-down");
  });

  it("renders default value warning", () => {
    const p = fakeProps();
    p.variable.isDefault = true;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
  });

  it("changes label", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    const wrapper = mount(<LocationForm {...p} />);
    wrapper.find("label").first().simulate("click");
    expect(error).not.toHaveBeenCalled();
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "new label" } });
    wrapper.find("input").first().simulate("blur");
    expect(p.onChange).toHaveBeenCalledWith(p.variable.celeryNode, "label");
  });

  it("doesn't change label", () => {
    const p = fakeProps();
    p.inUse = true;
    const wrapper = mount(<LocationForm {...p} />);
    wrapper.find("label").first().simulate("click");
    expect(error).toHaveBeenCalledWith("Can't edit variable name while in use.");
  });

  it("removes variable", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    const wrapper = shallow(<LocationForm {...p} />);
    wrapper.find(".fa-trash").simulate("click");
    expect(p.removeVariable).toHaveBeenCalledWith("label");
  });

  it("renders variable removal button as disabled", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    p.inUse = true;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(".fa-trash").props().style).toEqual({ color: Color.gray });
  });

  it("doesn't remove variable", () => {
    const p = fakeProps();
    p.removeVariable = undefined;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(".fa-trash").length).toEqual(0);
  });

  it("changes to number variable", () => {
    const p = fakeProps();
    mockShouldDisplay = true;
    const wrapper = shallow(<LocationForm {...p} />);
    wrapper.find(".fa-list-ol").simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "variable_declaration",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 0 } }
      },
    }, "label");
  });
});

describe("<NumericInput />", () => {
  const fakeProps = (): NumericInputProps => ({
    variable: {
      celeryNode: {
        kind: "parameter_declaration",
        args: {
          label: "label", default_value: {
            kind: "coordinate", args: { x: 0, y: 0, z: 0 }
          }
        }
      },
      dropdown: { label: "label", value: 0 },
      vector: { x: 0, y: 0, z: 0 }
    },
    onChange: jest.fn(),
    label: "label",
  });

  it("doesn't render input", () => {
    const wrapper = mount(<NumericInput {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("numeric-input");
  });

  it("changes variable", () => {
    const p = fakeProps();
    p.variable.celeryNode = {
      kind: "variable_declaration",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    const wrapper = mount(<NumericInput {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "variable_declaration",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 1 } }
      }
    }, "label");
  });

  it("changes default variable", () => {
    const p = fakeProps();
    p.variable.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    const wrapper = mount(<NumericInput {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "numeric", args: { number: 1 } }
      }
    }, "label");
  });
});

describe("<VariableIcon />", () => {
  const fakeProps = (): VariableIconProps => ({
    variable: {
      celeryNode: {
        kind: "parameter_declaration",
        args: {
          label: "label", default_value: {
            kind: "coordinate", args: { x: 0, y: 0, z: 0 }
          }
        }
      },
      dropdown: { label: "label", value: 0 },
      vector: { x: 0, y: 0, z: 0 }
    },
  });

  it("renders location icon", () => {
    const wrapper = mount(<VariableIcon {...fakeProps()} />);
    expect(wrapper.find("i").hasClass("fa-crosshairs")).toBeTruthy();
  });

  it("renders numeric icon", () => {
    const p = fakeProps();
    p.variable.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    const wrapper = mount(<VariableIcon {...p} />);
    expect(wrapper.find("i").hasClass("fa-hashtag")).toBeTruthy();
  });
});
