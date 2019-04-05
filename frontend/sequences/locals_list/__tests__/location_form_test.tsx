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
import { locationFormList, everyPointDDI } from "../location_form_list";
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
  });

  it("renders correct UI components", () => {
    const p = fakeProps();
    const el = shallow(<LocationForm {...p} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(BlurableInput);

    expect(selects.length).toBe(1);
    const select = selects.first().props();
    const choices = locationFormList(p.resources, [PARENT], true);
    const actualLabels = select.list.map(x => x.label).sort();
    const expectedLabels = choices.map(x => x.label).sort();
    const diff = difference(actualLabels, expectedLabels);
    expect(diff).toEqual([]);
    const choice = choices[1];
    select.onChange(choice);
    expect(p.onChange)
      .toHaveBeenCalledWith(convertDDItoVariable({
        label: "label",
        allowedVariableNodes: p.allowedVariableNodes
      })(choice));
    expect(inputs.length).toBe(3);
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
    expect(wrapper.text().toLowerCase()).toContain("new_var");
  });

  it("shows parent in dropdown", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list).toContain(PARENT);
  });

  it("doesn't show parent in dropdown", () => {
    const p = fakeProps();
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list).not.toContain(PARENT);
  });

  it("shows groups in dropdown", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    p.disallowGroups = false;
    const wrapper = shallow(<LocationForm {...p} />);
    expect(wrapper.find(FBSelect).first().props().list)
      .toContainEqual(everyPointDDI("Tool"));
  });
});
