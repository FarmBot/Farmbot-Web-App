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
  InputBox, generateList, handleSelect
} from "../step_tiles/tile_move_absolute/index";
import {
  ParentVariableFormProps,
  LocalsListProps,
} from "../locals_list_support";
import { DELETE_ME_LATER } from "../../resources/interfaces";

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
    deprecatedSequence: sequence,
    deprecatedResources: buildResourceIndex([sequence]).index,
    dispatch: jest.fn()
  };
};

describe("<ParentVariableForm/>", () => {
  it("renders correct UI components", () => {
    const props: ParentVariableFormProps = {
      parent: DELETE_ME_LATER,
      sequence: fakeSequence(),
      resources: buildResourceIndex().index,
      onChange: jest.fn()
    };

    const el = shallow(<ParentVariableForm {...props} />);
    const selects = el.find(FBSelect);
    const inputs = el.find(InputBox);

    expect(selects.length).toBe(1);
    const p = selects.first().props();
    expect(p.allowEmpty).toBe(true);
    const choices = generateList(props.resources, []);
    expect(p.list).toEqual(choices);
    const choice = choices[1];
    p.onChange(choice);
    expect(props.onChange)
      .toHaveBeenCalledWith(handleSelect(props.resources, choice));
    expect(inputs.length).toBe(3);
  });
});

describe("<LocalsList/>", () => {
  it("renders nothing", () => {
    const p = fakeProps();
    p.deprecatedSequence.body.args.locals = { kind: "scope_declaration", args: {} };
    const el = shallow(<LocalsList {...p} />);
    expect(el.find(ParentVariableForm).length).toBe(0);
  });

  it("renders something", () => {
    const p = fakeProps();
    p.deprecatedSequence.body.args.locals = {
      kind: "scope_declaration",
      args: {},
      body: [mrGoodVar]
    };
    const el = shallow(<LocalsList {...p} />);
    expect(el.find(ParentVariableForm).length).toBe(1);
  });
});
