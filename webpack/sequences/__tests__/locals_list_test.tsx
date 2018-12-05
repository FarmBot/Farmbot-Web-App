import * as React from "react";
import {
  ParentVariableForm,
  LocalsList,
} from "../locals_list";
import {
  VariableDeclaration,
  Coordinate
} from "farmbot";
import {
  fakeSequence,
  fakeTool
} from "../../__test_support__/fake_state/resources";
import { shallow } from "enzyme";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { FBSelect } from "../../ui/index";
import {
  InputBox, generateList, convertDDItoScopeDeclr
} from "../step_tiles/tile_move_absolute/index";
import {
  ParentVariableFormProps,
  LocalsListProps,
  PARENT,
} from "../locals_list_support";
import { difference } from "lodash";

const coord: Coordinate = { kind: "coordinate", args: { x: 1, y: 2, z: 3 } };
const t = fakeTool();
t.body.id = 5;
const mrGoodVar: VariableDeclaration = {
  // https://en.wikipedia.org/wiki/Mr._Goodbar
  kind: "variable_declaration",
  args: { label: "parent", data_value: coord }
};

const fakeProps = (): LocalsListProps => {
  const sequence = fakeSequence();
  return {
    variableData: {},
    sequence: sequence,
    resources: buildResourceIndex([sequence]).index,
    dispatch: jest.fn()
  };
};

const props: ParentVariableFormProps = {
  parent: {
    celeryNode: {
      kind: "parameter_declaration",
      args: { label: "label", data_type: "coordinate" }
    },
    editable: false,
    variableValue: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
    dropdown: { label: "label", value: 0 },
    location: { x: 0, y: 0, z: 0 }
  },
  sequence: fakeSequence(),
  resources: buildResourceIndex().index,
  onChange: jest.fn()
};

describe("<ParentVariableForm/>", () => {
  it("renders correct UI components", () => {
    const el = shallow(<ParentVariableForm {...props} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(InputBox);

    expect(selects.length).toBe(1);
    const p = selects.first().props();
    expect(p.allowEmpty).toBe(true);
    const choices = generateList(props.resources, [PARENT]);
    const actualLabels = p.list.map(x => x.label).sort();
    const expectedLabels = choices.map(x => x.label).sort();
    const diff = difference(actualLabels, expectedLabels);
    expect(diff).toEqual([]);
    const choice = choices[1];
    p.onChange(choice);
    expect(props.onChange)
      .toHaveBeenCalledWith(convertDDItoScopeDeclr(choice));
    expect(inputs.length).toBe(3);
  });
});

describe("<LocalsList/>", () => {

  it("renders nothing", () => {
    const p = fakeProps();
    p.sequence.body.args.locals = { kind: "scope_declaration", args: {} };
    const el = shallow(<LocalsList {...p} />);
    expect(el.find(ParentVariableForm).length).toBe(0);
  });

  it("renders something", () => {
    const p = fakeProps();
    p.variableData = {
      parent: {
        celeryNode: mrGoodVar,
        dropdown: { value: "parent", label: "parent" },
        location: coord.args,
        editable: false,
        variableValue: coord
      }
    };
    const el = shallow(<LocalsList {...p} />);
    expect(el.find(ParentVariableForm).length).toBe(1);
  });
});
