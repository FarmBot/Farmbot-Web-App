import * as React from "react";
import { LocationForm } from "../location_form";
import {
  fakeSequence
} from "../../../__test_support__/fake_state/resources";
import { shallow, mount } from "enzyme";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { FBSelect, BlurableInput } from "../../../ui/index";
import {
  LocationFormProps, PARENT, AllowedVariableNodes
} from "../locals_list_support";
import { difference } from "lodash";
import { locationFormList } from "../location_form_list";
import { convertDDItoVariable } from "../handle_select";

describe("<LocationForm/>", () => {
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
    shouldDisplay: jest.fn(),
    allowedVariableNodes: AllowedVariableNodes.parameter,
    customFilterRule: undefined
  });

  it("renders correct UI components", () => {
    const p = fakeProps();
    const el = shallow(<LocationForm {...p} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(BlurableInput);

    expect(selects.length).toBe(1);
    const select = selects.first().props();
    const choices = locationFormList(p.resources, [PARENT("")]);
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
      }));
    expect(inputs.length).toBe(0);
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
    expect(wrapper.text().toLowerCase())
      .toContain("location variable - add new");
  });

  it("shows parent in dropdown", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.shouldDisplay = () => true;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .toEqual(expect.arrayContaining([PARENT("Location Variable - Add new")]));
  });

  it("doesn't show parent in dropdown", () => {
    const p = fakeProps();
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .not.toEqual(expect.arrayContaining([PARENT("label")]));
  });

  it("shows correct variable label", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    p.variable.dropdown.label = "Externally defined";
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem).toEqual({
      label: "Externally defined", value: 0
    });
    expect(wrapper.find(FBSelect).first().props().list)
      .toEqual(expect.arrayContaining([PARENT("Externally defined")]));
  });

  it("shows add new variable option", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.shouldDisplay = () => true;
    p.variable.dropdown.isNull = true;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .toEqual(expect.arrayContaining([PARENT("Location Variable - Add new")]));
  });

  it("shows groups in dropdown", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list).toContainEqual({
      headingId: "Coordinate",
      label: "Custom Coordinates",
      value: ""
    });
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
});
