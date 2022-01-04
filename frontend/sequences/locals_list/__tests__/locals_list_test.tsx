jest.mock("../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

import React from "react";
import {
  generateNewVariableLabel,
  localListCallback, LocalsList, removeVariable, RemoveVariableProps,
} from "../locals_list";
import {
  ParameterApplication, Coordinate, ParameterDeclaration, VariableDeclaration,
} from "farmbot";
import {
  fakeRegimen,
  fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import { shallow } from "enzyme";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { LocalsListProps, AllowedVariableNodes } from "../locals_list_support";
import { VariableNameSet } from "../../../resources/interfaces";
import { VariableForm } from "../variable_form";
import { error } from "../../../toast/toast";
import { overwrite } from "../../../api/crud";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import { cloneDeep } from "lodash";

describe("<LocalsList/>", () => {
  const coordinate: Coordinate = {
    kind: "coordinate",
    args: { x: 1, y: 2, z: 3 }
  };
  const mrGoodVar: ParameterApplication = {
    // https://en.wikipedia.org/wiki/Mr._Goodbar
    kind: "parameter_application",
    args: { label: "label", data_value: coordinate }
  };
  const variableData: VariableNameSet = {
    "label": {
      celeryNode: mrGoodVar,
      dropdown: { value: "label", label: "label" },
      vector: coordinate.args,
    }
  };

  const fakeProps = (): LocalsListProps => {
    const sequence = fakeSequence();
    return {
      variableData: undefined,
      sequenceUuid: sequence.uuid,
      resources: buildResourceIndex([sequence]).index,
      onChange: jest.fn(),
      allowedVariableNodes: AllowedVariableNodes.parameter,
    };
  };

  it("doesn't have any variables to render", () => {
    const wrapper = shallow(<LocalsList {...fakeProps()} />);
    expect(wrapper.find(VariableForm).length).toBe(0);
  });

  it("shows all variables", () => {
    const p = fakeProps();
    p.variableData = variableData;
    const wrapper = shallow(<LocalsList {...p} />);
    expect(wrapper.find(VariableForm).length).toBe(1);
  });

  it("hides already assigned variables", () => {
    const p = fakeProps();
    p.allowedVariableNodes = AllowedVariableNodes.identifier;
    p.bodyVariables = [];
    p.variableData = variableData;
    const wrapper = shallow(<LocalsList {...p} />);
    expect(wrapper.find(VariableForm).length).toBe(0);
  });
});

describe("localListCallback()", () => {
  it("handles a new local declaration", () => {
    const sequence = fakeSequence();
    const dispatch = jest.fn();
    const cb = localListCallback({ sequence, dispatch });
    const parameterDeclaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: {
          kind: "coordinate", args: { x: 1, y: 2, z: 3 }
        }
      }
    };
    const variableDeclaration: VariableDeclaration = {
      kind: "variable_declaration",
      args: {
        label: "foo",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };
    cb([parameterDeclaration, variableDeclaration])({
      kind: "variable_declaration",
      args: {
        label: "foo",
        data_value: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } }
      }
    }, "foo");
    const newSequenceBody = cloneDeep(sequence.body);
    newSequenceBody.args.locals.body = [
      {
        kind: "parameter_declaration",
        args: {
          label: "label", default_value: {
            kind: "coordinate", args: { x: 1, y: 2, z: 3 }
          }
        }
      },
      {
        kind: "variable_declaration",
        args: {
          label: "foo",
          data_value: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } }
        }
      },
    ];
    expect(overwrite).toHaveBeenCalledWith(sequence, newSequenceBody);
  });
});

describe("removeVariable()", () => {
  const fakeProps = (): RemoveVariableProps => {
    const sequence = fakeSequence();
    sequence.body.args.locals = {
      kind: "scope_declaration",
      args: {},
      body: [
        {
          kind: "parameter_declaration",
          args: {
            label: "label",
            default_value: {
              kind: "coordinate",
              args: { x: 0, y: 0, z: 0 },
            },
          }
        },
      ]
    };
    return {
      dispatch: jest.fn(),
      resource: sequence,
      variableData: {},
    };
  };

  it("removes variable", () => {
    const p = fakeProps();
    removeVariable(p)("label");
    const newSequence = cloneDeep(p.resource);
    newSequence.kind == "Sequence" && (newSequence.body.args.locals.body = []);
    expect(overwrite).toHaveBeenCalledWith(p.resource, newSequence.body);
    expect(error).not.toHaveBeenCalled();
  });

  it("removes variable: regimen", () => {
    const p = fakeProps();
    p.resource = fakeRegimen();
    p.resource.body.body = [
      {
        kind: "parameter_declaration",
        args: {
          label: "label",
          default_value: {
            kind: "coordinate",
            args: { x: 0, y: 0, z: 0 },
          },
        }
      },
    ];
    removeVariable(p)("label");
    const updatedRegimen = cloneDeep(p.resource);
    updatedRegimen.kind == "Regimen" && (updatedRegimen.body.body = []);
    expect(overwrite).toHaveBeenCalledWith(p.resource, updatedRegimen.body);
    expect(error).not.toHaveBeenCalled();
  });

  it("removes variable: regimen with missing data", () => {
    const p = fakeProps();
    p.resource = fakeRegimen();
    p.resource.body.body = [
      {
        kind: "parameter_declaration",
        args: {
          label: "label",
          default_value: {
            kind: "coordinate",
            args: { x: 0, y: 0, z: 0 },
          },
        }
      },
    ];
    p.variableData = undefined as unknown as VariableNameSet;
    removeVariable(p)("label");
    const updatedRegimen = cloneDeep(p.resource);
    updatedRegimen.kind == "Regimen" && (updatedRegimen.body.body = []);
    expect(overwrite).toHaveBeenCalledWith(p.resource, updatedRegimen.body);
    expect(error).not.toHaveBeenCalled();
  });

  it("no variables to remove", () => {
    const p = fakeProps();
    p.resource.kind == "Sequence" &&
      (p.resource.body.args.locals.body = undefined);
    removeVariable(p)("label");
    expect(overwrite).toHaveBeenCalledWith(p.resource, p.resource.body);
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't remove variable", () => {
    const p = fakeProps();
    p.resource.body.body = [{
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "identifier", args: { label: "label" } },
          },
        }],
    }];
    removeVariable(p)("label");
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "cannot be deleted"));
    expect(overwrite).not.toHaveBeenCalled();
  });
});

describe("generateNewVariableLabel()", () => {
  it("generates new first label", () => {
    expect(generateNewVariableLabel([], n => "" + n)).toEqual("1");
  });

  it("generates new label", () => {
    const variables = Object.values(fakeVariableNameSet()).map(v => v?.celeryNode);
    expect(generateNewVariableLabel(variables, n => "" + n)).toEqual("1");
  });

  it("generates new unique label", () => {
    const variables = Object.values(fakeVariableNameSet()).map(v => v?.celeryNode);
    variables.push(cloneDeep(variables[0]));
    variables[1] && (variables[1].args.label = "1");
    expect(generateNewVariableLabel(variables, n => "" + n)).toEqual("2");
  });
});
