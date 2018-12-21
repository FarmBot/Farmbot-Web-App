import * as React from "react";
import { LocationForm, LocalsList } from "../locals_list";
import { VariableDeclaration, Coordinate } from "farmbot";
import {
  fakeSequence
} from "../../../__test_support__/fake_state/resources";
import { shallow, mount } from "enzyme";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { FBSelect } from "../../../ui/index";
import {
  LocationFormProps, LocalsListProps, PARENT, AllowedDeclaration
} from "../locals_list_support";
import { difference } from "lodash";
import { VariableNameSet } from "../../../resources/interfaces";
import { InputBox, generateList } from "../../step_tiles/tile_move_absolute/index";
import { convertDDItoDeclaration } from "../handle_select";

describe("<LocationForm/>", () => {
  const fakeProps = (): LocationFormProps => ({
    variable: {
      celeryNode: {
        kind: "parameter_declaration",
        args: { label: "label", data_type: "coordinate" }
      },
      dropdown: { label: "label", value: 0 },
      vector: { x: 0, y: 0, z: 0 }
    },
    sequenceUuid: fakeSequence().uuid,
    resources: buildResourceIndex().index,
    onChange: jest.fn(),
    shouldDisplay: jest.fn(),
    allowedDeclarations: AllowedDeclaration.parameter,
  });

  it("renders correct UI components", () => {
    const p = fakeProps();
    const el = shallow(<LocationForm {...p} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(InputBox);

    expect(selects.length).toBe(1);
    const select = selects.first().props();
    expect(select.allowEmpty).toBe(true);
    const choices = generateList(p.resources, [PARENT]);
    const actualLabels = select.list.map(x => x.label).sort();
    const expectedLabels = choices.map(x => x.label).sort();
    const diff = difference(actualLabels, expectedLabels);
    expect(diff).toEqual([]);
    const choice = choices[1];
    select.onChange(choice);
    expect(p.onChange)
      .toHaveBeenCalledWith(convertDDItoDeclaration({ label: "label" })(choice));
    expect(inputs.length).toBe(3);
  });

  it("uses local declaration data", () => {
    const p = fakeProps();
    p.declarations = [{
      kind: "variable_declaration",
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
});

describe("<LocalsList/>", () => {
  const coordinate: Coordinate = {
    kind: "coordinate",
    args: { x: 1, y: 2, z: 3 }
  };
  const mrGoodVar: VariableDeclaration = {
    // https://en.wikipedia.org/wiki/Mr._Goodbar
    kind: "variable_declaration",
    args: { label: "parent", data_value: coordinate }
  };
  const variableData: VariableNameSet = {
    parent: {
      celeryNode: mrGoodVar,
      dropdown: { value: "parent", label: "parent" },
      vector: coordinate.args,
    }
  };

  const fakeProps = (): LocalsListProps => {
    const sequence = fakeSequence();
    return {
      variableData: {},
      sequenceUuid: sequence.uuid,
      resources: buildResourceIndex([sequence]).index,
      onChange: jest.fn(),
      shouldDisplay: jest.fn(),
      allowedDeclarations: AllowedDeclaration.parameter,
    };
  };

  it("doesn't have any declarations to render", () => {
    const wrapper = shallow(<LocalsList {...fakeProps()} />);
    expect(wrapper.find(LocationForm).length).toBe(0);
  });

  it("shows all variables", () => {
    const p = fakeProps();
    p.variableData = variableData;
    const wrapper = shallow(<LocalsList {...p} />);
    expect(wrapper.find(LocationForm).length).toBe(1);
  });

  it("hides already assigned variables", () => {
    const p = fakeProps();
    p.allowedDeclarations = AllowedDeclaration.identifier;
    p.variableData = variableData;
    const wrapper = shallow(<LocalsList {...p} />);
    expect(wrapper.find(LocationForm).length).toBe(0);
  });
});
