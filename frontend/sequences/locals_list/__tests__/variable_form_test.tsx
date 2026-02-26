import React from "react";
import {
  Label,
  LabelProps,
  VariableForm, NumericInput, NumericInputProps, TextInput, TextInputProps,
} from "../variable_form";
import {
  fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import { render, fireEvent } from "@testing-library/react";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { Color } from "../../../ui";
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
import * as ui from "../../../ui";

let mockSelectChangeArg: unknown;
let mockKeyCallback = { key: "", buffer: "" };
let fbSelectSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;
let helpSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      list: unknown[];
      selectedItem: unknown;
      onChange: (ddi: unknown) => void;
    }) => <button
      className={"fb-select-mock"}
      data-list={JSON.stringify(props.list)}
      data-selected-item={JSON.stringify(props.selectedItem)}
      onClick={() => props.onChange(mockSelectChangeArg)} />);
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation((props: {
      className?: string;
      value: string | number;
      disabled?: boolean;
      onCommit?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
      keyCallback?: (key: string, buffer: string) => void;
    }) => {
      const [value, setValue] = React.useState(String(props.value));
      React.useEffect(() => setValue(String(props.value)), [props.value]);
      return <div>
        <input
          className={props.className}
          disabled={props.disabled}
          value={value}
          onChange={e => setValue(e.currentTarget.value)}
          onBlur={e => props.onCommit?.({
            ...e, currentTarget: {
              ...e.currentTarget, value
            }
          } as React.SyntheticEvent<HTMLInputElement>)} />
        <button
          className={"blurable-key-callback"}
          onClick={() =>
            props.keyCallback?.(mockKeyCallback.key, mockKeyCallback.buffer)} />
      </div>;
    });
  helpSpy = jest.spyOn(ui, "Help")
    .mockImplementation(() => <div className={"help-mock"} />);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
  blurableInputSpy.mockRestore();
  helpSpy.mockRestore();
});

const listAt = (container: ParentNode, index = 0) =>
  JSON.parse(
    container.querySelectorAll(".fb-select-mock")
      .item(index)
      .getAttribute("data-list") || "[]");

const selectedAt = (container: ParentNode, index = 0) =>
  JSON.parse(
    container.querySelectorAll(".fb-select-mock")
      .item(index)
      .getAttribute("data-selected-item") || "null");

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
    const { container } = render(<VariableForm {...p} />);
    expect(container.querySelectorAll(".fb-select-mock").length).toBe(2);
    const choices = variableFormList(
      p.resources, [], [{ label: "Externally defined", value: "" }], true);
    const actualLabels: string[] = listAt(container).map(x => String(x.label)).sort();
    const expectedLabels: string[] = choices.map(x => String(x.label)).sort();
    const diff = difference(actualLabels, expectedLabels);
    expect(diff).toEqual([]);
    const dropdown = choices[1];
    mockSelectChangeArg = dropdown;
    fireEvent.click(container.querySelector(".fb-select-mock") as Element);
    expect(p.onChange)
      .toHaveBeenCalledWith(convertDDItoVariable({
        identifierLabel: "label",
        allowedVariableNodes: p.allowedVariableNodes,
        dropdown
      }), "label");
    expect(container.querySelectorAll(".blurable-key-callback").length).toBe(3);
    expect(container.innerHTML).not.toContain("fa-exclamation-triangle");
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
    const { container } = render(<VariableForm {...p} />);
    expect(selectedAt(container).label.toLowerCase()).toContain("add new");
  });

  it("shows corrected variable label", () => {
    const p = fakeProps();
    p.variable.celeryNode.args.label = "parent";
    p.inUse = true;
    const { container } = render(<VariableForm {...p} />);
    expect((container.querySelector("input[readonly]") as HTMLInputElement).value)
      .toEqual("Location");
  });

  it("shows variable in dropdown", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    const variableNameSet = fakeVariableNameSet("parent");
    p.resources.sequenceMetas[p.sequenceUuid] = variableNameSet;
    const { container } = render(<VariableForm {...p} />);
    expect(listAt(container))
      .toEqual(expect.arrayContaining([{
        headingId: "Variable",
        label: "Location - Select a location",
        value: "parent",
      }]));
  });

  it("doesn't show variable in dropdown", () => {
    const p = fakeProps();
    const { container } = render(<VariableForm {...p} />);
    expect(listAt(container))
      .not.toEqual(expect.arrayContaining([{
        headingId: "Variable",
        label: "label",
        value: "Location 1",
      }]));
  });

  it("shows correct variable label", () => {
    const p = fakeProps();
    p.variable.dropdown.label = "Externally defined";
    const { container } = render(<VariableForm {...p} />);
    expect(selectedAt(container)).toEqual({
      label: "Externally defined", value: 0
    });
    expect(listAt(container))
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
    const { container } = render(<VariableForm {...p} />);
    const list = listAt(container);
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
    const { container } = render(<VariableForm {...p} />);
    expect(listAt(container)).toContainEqual({
      headingId: "Coordinate",
      label: "Custom coordinates",
      value: ""
    });
  });

  it("shows coordinate input boxes", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    p.hideWrapper = false;
    const { container } = render(<VariableForm {...p} />);
    const boxes = container.querySelector(".custom-coordinate-form");
    expect(boxes?.querySelectorAll(".x").length).toEqual(1);
    expect(boxes?.querySelectorAll(".y").length).toEqual(1);
    expect(boxes?.querySelectorAll(".z").length).toEqual(1);
  });

  it("renders default value warning", () => {
    const p = fakeProps();
    p.locationDropdownKey = "default_value";
    p.variable.isDefault = true;
    const { container } = render(<VariableForm {...p} />);
    expect(container.querySelectorAll(".help-mock").length).toEqual(3);
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
    const { container } = render(<VariableForm {...p} />);
    expect(container.innerHTML).toContain("number-input");
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
    const { container } = render(<VariableForm {...p} />);
    expect(container.innerHTML).toContain("string-input");
  });

  it("doesn't change label", () => {
    const p = fakeProps();
    p.inUse = true;
    const { container } = render(<VariableForm {...p} />);
    fireEvent.click(container.querySelector("input[readonly]") as Element);
    expect(error).toHaveBeenCalledWith("Can't edit variable name while in use.");
  });

  it("removes variable", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    const { container } = render(<VariableForm {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(p.removeVariable).toHaveBeenCalledWith("label");
  });

  it("renders variable removal button as disabled", () => {
    const p = fakeProps();
    p.removeVariable = jest.fn();
    p.inUse = true;
    const { container } = render(<VariableForm {...p} />);
    expect((container.querySelector(".fa-trash") as HTMLElement).style.color)
      .toEqual(Color.gray);
  });

  it("doesn't remove variable", () => {
    const p = fakeProps();
    p.removeVariable = undefined;
    const { container } = render(<VariableForm {...p} />);
    expect(container.querySelectorAll(".fa-trash").length).toEqual(0);
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
    const { container } = render(<VariableForm {...p} />);
    expect(container.querySelectorAll(".numeric-variable-input").length)
      .toBeGreaterThanOrEqual(1);
    expect(listAt(container)).toEqual([
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
    const { container } = render(<VariableForm {...p} />);
    expect(container.querySelectorAll(".numeric-variable-input").length)
      .toEqual(0);
    expect(listAt(container)).toEqual([
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
    const { container } = render(<VariableForm {...p} />);
    expect(container.querySelectorAll(".text-variable-input").length)
      .toBeGreaterThanOrEqual(1);
    expect(listAt(container)).toEqual([
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
    const { container } = render(<VariableForm {...p} />);
    expect(container.querySelectorAll(".text-variable-input").length).toEqual(0);
    expect(listAt(container)).toEqual([
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
    const { container } = render(<VariableForm {...p} />);
    expect(listAt(container)).toEqual([
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
    const { container } = render(<VariableForm {...p} />);
    expect(listAt(container)).toEqual([
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
    const { container } = render(<VariableForm {...p} />);
    expect(listAt(container)).toEqual([
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
    const { container } = render(<VariableForm {...p} />);
    expect(listAt(container)).toEqual([
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
    const wrapper = render(<NumericInput {...p} />);
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
    const wrapper = render(<NumericInput {...p} />);
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
    const wrapper = render(<NumericInput {...p} />);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<NumericInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<NumericInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<NumericInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<NumericInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "k", buffer: "" };
    const { container } = render(<NumericInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    const wrapper = render(<TextInput {...p} />);
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
    const wrapper = render(<TextInput {...p} />);
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
    const wrapper = render(<TextInput {...p} />);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<TextInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<TextInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<TextInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "", buffer: "" };
    const { container } = render(<TextInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    mockKeyCallback = { key: "k", buffer: "" };
    const { container } = render(<TextInput {...p} />);
    fireEvent.click(container.querySelector(".blurable-key-callback") as Element);
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
    const { container } = render(<Label {...p} />);
    const input = container.querySelector("input") as Element;
    fireEvent.change(input, { target: { value: "new label" } });
    expect((input as HTMLInputElement).value).toEqual("new label");
    fireEvent.blur(input);
    const newVariableNode = cloneDeep(p.variable.celeryNode);
    newVariableNode.args.label = "new label";
    expect(p.onChange).toHaveBeenCalledWith(newVariableNode, "label");
  });

  it("doesn't render input", () => {
    const p = fakeProps();
    p.inUse = true;
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    const { container } = render(<Label {...p} />);
    expect(container.querySelectorAll("input").length).toEqual(0);
  });

  it("doesn't render input: prop", () => {
    const p = fakeProps();
    p.inUse = true;
    p.allowedVariableNodes = AllowedVariableNodes.parameter;
    p.labelOnly = true;
    const { container } = render(<Label {...p} />);
    expect(container.querySelectorAll("input").length).toEqual(0);
  });
});
