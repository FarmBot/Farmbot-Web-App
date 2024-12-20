import React from "react";
import {
  Label,
  LabelProps,
  VariableForm, NumericInput, NumericInputProps, TextInput, TextInputProps,
} from "../variable_form";
import {
  fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import { shallow, mount } from "enzyme";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { FBSelect, BlurableInput, Color, FBSelectProps } from "../../../ui";
import {
  VariableFormProps, AllowedVariableNodes, VariableType,
} from "../locals_list_support";
import { cloneDeep, difference } from "lodash";
import { variableFormList } from "../variable_form_list";
import { convertDDItoVariable } from "../handle_select";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import { error } from "../../../toast/toast";
import { changeBlurableInput } from "../../../__test_support__/helpers";
import { SequenceMeta } from "../../../resources/sequence_meta";

describe("<VariableForm />", () => {
  const fakeProps = (): VariableFormProps => ({
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
    variableType: VariableType.Location,
  });

  it("renders correct UI components", () => {
    const p = fakeProps();
    const el = shallow(<VariableForm {...p} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(BlurableInput);

    expect(selects.length).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const select = selects.first().props() as FBSelectProps;
    const choices = variableFormList(
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
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("add new");
  });

  it("shows corrected variable label", () => {
    const p = fakeProps();
    p.variable.celeryNode.args.label = "parent";
    p.inUse = true;
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find("input").first().props().value).toEqual("Location");
  });

  it("shows variable in dropdown", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    const variableNameSet = fakeVariableNameSet("parent");
    p.resources.sequenceMetas[p.sequenceUuid] = variableNameSet;
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .toEqual(expect.arrayContaining([{
        headingId: "Variable",
        label: "Location - Select a location",
        value: "parent",
      }]));
  });

  it("doesn't show variable in dropdown", () => {
    const p = fakeProps();
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .not.toEqual(expect.arrayContaining([{
        headingId: "Variable",
        label: "label",
        value: "Location 1",
      }]));
  });

  it("shows correct variable label", () => {
    const p = fakeProps();
    p.variable.dropdown.label = "Externally defined";
    const wrapper = shallow(<VariableForm {...p} />);
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
    const wrapper = shallow(<VariableForm {...p} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const list = (wrapper.find(FBSelect).first().props() as FBSelectProps).list;
    const vars = list.filter(item =>
      item.headingId == "Variable" && !item.heading);
    expect(vars.length).toEqual(1);
    expect(vars[0].value).toEqual("Location 1");
    expect(vars[0].label).toEqual("Add new");
    expect(list).toEqual(expect.arrayContaining([{
      headingId: "Variable",
      label: "Add new",
      value: "Location 1",
    }]));
  });

  it("shows groups in dropdown", () => {
    const p = fakeProps();
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list).toContainEqual({
      headingId: "Coordinate",
      label: "Custom coordinates",
      value: ""
    });
  });

  it("shows coordinate input boxes", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    p.hideWrapper = false;
    const wrapper = mount(<VariableForm {...p} />);
    const boxes = wrapper.find(".custom-coordinate-form");
    expect(boxes.find(".x").length).toEqual(1);
    expect(boxes.find(".y").length).toEqual(1);
    expect(boxes.find(".z").length).toEqual(1);
  });

  it("renders default value warning", () => {
    const p = fakeProps();
    p.locationDropdownKey = "default_value";
    p.variable.isDefault = true;
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
  });

  it("renders number variable input", () => {
    const p = fakeProps();
    p.variableType = VariableType.Number;
    p.variable.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    p.locationDropdownKey = "default_value";
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.html()).toContain("number-input");
  });

  it("renders text variable input", () => {
    const p = fakeProps();
    p.variableType = VariableType.Text;
    p.variable.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text", args: { string: "" } }
      }
    };
    p.locationDropdownKey = "default_value";
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.html()).toContain("string-input");
  });

  it("doesn't change label", () => {
    const p = fakeProps();
    p.inUse = true;
    const wrapper = mount(<VariableForm {...p} />);
    wrapper.find("input").first().simulate("click");
    expect(error).toHaveBeenCalledWith("Can't edit variable name while in use.");
  });

  it("removes variable", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    const wrapper = shallow(<VariableForm {...p} />);
    wrapper.find(".fa-trash").simulate("click");
    expect(p.removeVariable).toHaveBeenCalledWith("label");
  });

  it("renders variable removal button as disabled", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    p.inUse = true;
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.find(".fa-trash").props().style).toEqual({ color: Color.gray });
  });

  it("doesn't remove variable", () => {
    const p = fakeProps();
    p.removeVariable = undefined;
    const wrapper = shallow(<VariableForm {...p} />);
    expect(wrapper.find(".fa-trash").length).toEqual(0);
  });

  it("renders number variable", () => {
    const p = fakeProps();
    p.variableType = VariableType.Number;
    p.variable.celeryNode = {
      kind: "variable_declaration",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find(".numeric-variable-input").length)
      .toBeGreaterThanOrEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      {
        headingId: "Variable",
        label: "Externally defined",
        value: "label",
      },
      {
        headingId: "Numeric",
        label: "Custom number",
        value: 0,
      },
    ]);
  });

  it("doesn't render number variable", () => {
    const p = fakeProps();
    p.variableType = VariableType.Number;
    p.variable.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "numeric", args: { number: 0 } }
      }
    };
    p.bodyVariables = [{
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 0 } }
      }
    }];
    const variable: SequenceMeta = {
      celeryNode: {
        kind: "parameter_declaration",
        args: {
          label: "label", default_value: {
            kind: "numeric", args: { number: 0 }
          }
        }
      },
      dropdown: { label: "label", value: 0 },
      vector: { x: 0, y: 0, z: 0 },
    };
    p.resources.sequenceMetas[p.sequenceUuid] = { "label": variable };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find(".numeric-variable-input").length)
      .toEqual(0);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      {
        headingId: "Variable",
        label: "Externally defined",
        value: "label",
      },
      {
        headingId: "Numeric",
        label: "Custom number",
        value: 0,
      },
    ]);
  });

  it("renders text variable", () => {
    const p = fakeProps();
    p.variableType = VariableType.Text;
    p.variable.celeryNode = {
      kind: "variable_declaration",
      args: {
        label: "label", data_value: { kind: "text", args: { string: "" } }
      }
    };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find(".text-variable-input").length).toBeGreaterThanOrEqual(1);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      {
        headingId: "Variable",
        label: "Externally defined",
        value: "label",
      },
      {
        headingId: "Text",
        label: "Custom text",
        value: "",
      },
    ]);
  });

  it("doesn't render text variable", () => {
    const p = fakeProps();
    p.variableType = VariableType.Text;
    p.variable.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text", args: { string: "" } }
      }
    };
    p.bodyVariables = [{
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "text", args: { string: "" } }
      }
    }];
    const variable: SequenceMeta = {
      celeryNode: {
        kind: "parameter_declaration",
        args: {
          label: "label", default_value: {
            kind: "text", args: { string: "" }
          }
        }
      },
      dropdown: { label: "label", value: 0 },
      vector: { x: 0, y: 0, z: 0 },
    };
    p.resources.sequenceMetas[p.sequenceUuid] = { "label": variable };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find(".text-variable-input").length).toEqual(0);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      {
        headingId: "Variable",
        label: "Externally defined",
        value: "label",
      },
      {
        headingId: "Text",
        label: "Custom text",
        value: "",
      },
    ]);
  });

  it("renders resource_placeholder variable", () => {
    const p = fakeProps();
    p.variableType = VariableType.Resource;
    p.variable.celeryNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: {
          kind: "resource_placeholder", args: { resource_type: "Sequence" }
        }
      }
    };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find("FBSelect").first().props().list).toEqual([
      {
        headingId: "Variable",
        label: "Externally defined",
        value: "label",
      },
    ]);
  });

  it("renders resource variable: sequence", () => {
    const p = fakeProps();
    p.variableType = VariableType.Resource;
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.variable.celeryNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "resource_placeholder", args: { resource_type: "Sequence" }
        }
      }
    };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find("FBSelect").first().props().list).toEqual([
      {
        headingId: "Sequence",
        label: "Sequence",
        value: 0,
        heading: true,
      },
      {
        headingId: "Sequence",
        label: "Goto 0, 0, 0",
        value: "23",
      },
    ]);
  });

  it("renders resource variable: peripheral", () => {
    const p = fakeProps();
    p.variableType = VariableType.Resource;
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.variable.celeryNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "resource_placeholder", args: { resource_type: "Peripheral" }
        }
      }
    };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find("FBSelect").first().props().list).toEqual([
      {
        headingId: "Peripheral",
        label: "Peripherals",
        value: 0,
        heading: true,
      },
      {
        headingId: "Peripheral",
        label: "LED",
        value: "11",
      },
    ]);
  });

  it("renders resource variable: Sensor", () => {
    const p = fakeProps();
    p.variableType = VariableType.Resource;
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.variable.celeryNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "resource_placeholder", args: { resource_type: "Sensor" }
        }
      }
    };
    const wrapper = mount(<VariableForm {...p} />);
    expect(wrapper.find("FBSelect").first().props().list).toEqual([
      {
        headingId: "Sensor",
        label: "Sensors",
        value: 0,
        heading: true,
      },
      {
        headingId: "Sensor",
        label: "Sensor",
        value: "11",
      },
    ]);
  });
});

describe("<NumericInput />", () => {
  const fakeProps = (): NumericInputProps => ({
    variableNode: {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    },
    onChange: jest.fn(),
    label: "label",
    isDefaultValueForm: false,
  });

  it("changes variable", () => {
    const p = fakeProps();
    p.variableNode = {
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
    p.variableNode = {
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

  it("doesn't change variable", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "number_placeholder", args: {} }
      }
    };
    const wrapper = mount(<NumericInput {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("removes placeholder", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "number_placeholder", args: {} }
      }
    };
    const wrapper = shallow(<NumericInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 0 } }
      }
    }, "label");
  });

  it("adds placeholder", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 1 } }
      }
    };
    const wrapper = shallow(<NumericInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "number_placeholder", args: {} }
      }
    }, "label");
  });

  it("removes placeholder: declaration", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "number_placeholder", args: {} }
      }
    };
    const wrapper = shallow(<NumericInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "numeric", args: { number: 0 } }
      }
    }, "label");
  });

  it("adds placeholder: declaration", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "numeric", args: { number: 1 } }
      }
    };
    const wrapper = shallow(<NumericInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "number_placeholder", args: {} }
      }
    }, "label");
  });

  it("doesn't toggle placeholder", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "numeric", args: { number: 1 } }
      }
    };
    const wrapper = shallow(<NumericInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("k", "");
    expect(p.onChange).not.toHaveBeenCalled();
  });
});

describe("<TextInput />", () => {
  const fakeProps = (): TextInputProps => ({
    variableNode: {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    },
    onChange: jest.fn(),
    label: "label",
    isDefaultValueForm: false,
  });

  it("changes variable", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "variable_declaration",
      args: {
        label: "label", data_value: { kind: "text", args: { string: "" } }
      }
    };
    const wrapper = mount(<TextInput {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "variable_declaration",
      args: {
        label: "label", data_value: { kind: "text", args: { string: "1" } }
      }
    }, "label");
  });

  it("changes default variable", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text", args: { string: "" } }
      }
    };
    const wrapper = mount(<TextInput {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text", args: { string: "1" } }
      }
    }, "label");
  });

  it("doesn't change variable", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "text_placeholder", args: {} }
      }
    };
    const wrapper = mount(<TextInput {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("removes placeholder", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "text_placeholder", args: {} }
      }
    };
    const wrapper = shallow(<TextInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "text", args: { string: "" } }
      }
    }, "label");
  });

  it("adds placeholder", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "text", args: { string: "" } }
      }
    };
    const wrapper = shallow(<TextInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "text_placeholder", args: {} }
      }
    }, "label");
  });

  it("removes placeholder: declaration", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text_placeholder", args: {} }
      }
    };
    const wrapper = shallow(<TextInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text", args: { string: "" } }
      }
    }, "label");
  });

  it("adds placeholder: declaration", () => {
    const p = fakeProps();
    p.isDefaultValueForm = true;
    p.variableNode = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text", args: { string: "" } }
      }
    };
    const wrapper = shallow(<TextInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("", "");
    expect(p.onChange).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: { kind: "text_placeholder", args: {} }
      }
    }, "label");
  });

  it("doesn't toggle placeholder", () => {
    const p = fakeProps();
    p.variableNode = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: { kind: "text", args: { string: "" } }
      }
    };
    const wrapper = shallow(<TextInput {...p} />);
    wrapper.find(BlurableInput).props().keyCallback?.("k", "");
    expect(p.onChange).not.toHaveBeenCalled();
  });
});

describe("<Label />", () => {
  const fakeProps = (): LabelProps => ({
    label: "label",
    inUse: undefined,
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
    allowedVariableNodes: AllowedVariableNodes.parameter,
  });

  it("changes label", () => {
    const p = fakeProps();
    const wrapper = shallow<LabelProps>(<Label {...p} />);
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "new label" } });
    expect(wrapper.state().labelValue).toEqual("new label");
    wrapper.find("input").first().simulate("blur");
    const newVariableNode = cloneDeep(p.variable.celeryNode);
    newVariableNode.args.label = "new label";
    expect(p.onChange).toHaveBeenCalledWith(newVariableNode, "label");
  });

  it("doesn't render input", () => {
    const p = fakeProps();
    p.inUse = true;
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    const wrapper = shallow<LabelProps>(<Label {...p} />);
    expect(wrapper.find("input").length).toEqual(0);
  });

  it("doesn't render input: prop", () => {
    const p = fakeProps();
    p.inUse = true;
    p.allowedVariableNodes = AllowedVariableNodes.parameter;
    p.labelOnly = true;
    const wrapper = shallow<LabelProps>(<Label {...p} />);
    expect(wrapper.find("input").length).toEqual(0);
  });
});
