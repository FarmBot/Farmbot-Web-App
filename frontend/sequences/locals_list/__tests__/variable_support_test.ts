import {
  variableList, mergeParameterApplications, getRegimenVariableData
} from "../variable_support";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import {
  ParameterApplication, ParameterDeclaration, ScopeDeclarationBodyItem,
  Coordinate, VariableDeclaration
} from "farmbot";
import { cloneDeep } from "lodash";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";

const COORDINATE: Coordinate = { kind: "coordinate", args: { x: 1, y: 2, z: 3 } };

const coordinateVar = (label: string): ParameterApplication =>
  ({
    kind: "parameter_application", args: {
      label, data_value: COORDINATE
    }
  });

describe("variableList()", () => {
  it("returns undefined", () => {
    const result = variableList(undefined);
    expect(result).toEqual(undefined);
  });

  it("returns parameter applications", () => {
    const result = variableList({
      parent1: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent1", default_value: COORDINATE
          }
        },
        dropdown: { label: "Parent1", value: "parent1" },
        vector: undefined,
      },
      parent2: {
        celeryNode: coordinateVar("parent2"),
        dropdown: { label: "Parent2", value: "parent2" },
        vector: COORDINATE.args,
      }
    });
    expect(result).toEqual([{
      kind: "parameter_application",
      args: { label: "parent1", data_value: COORDINATE }
    }]);
  });
});

describe("mergeParameterApplications()", () => {
  const bodyVariables: ParameterApplication[] = [
    coordinateVar("parent1"),
    coordinateVar("parent2"),
  ];

  it("doesn't overwrite bodyVariables", () => {
    const varData = fakeVariableNameSet("parent1");
    const result = mergeParameterApplications(varData, bodyVariables);
    expect(result).toEqual(bodyVariables);
  });

  it("adds new bodyVariables", () => {
    // "parent2" will not be added: already exists
    const varData = fakeVariableNameSet("parent2");

    // "parent3" will not be added: already defined
    const notAdded = "parent3";
    varData[notAdded] = fakeVariableNameSet(notAdded)[notAdded];

    // "parent4" will be added to the existing bodyVariables
    const label = "parent4";
    const add = fakeVariableNameSet(label)[label];
    const addedNewDecl: ParameterDeclaration = {
      kind: "parameter_declaration", args: {
        label, default_value: COORDINATE
      }
    };
    add && (add.celeryNode = addedNewDecl);
    varData[label] = add;
    const expected = cloneDeep(bodyVariables);
    expected.push({
      kind: "parameter_application", args: {
        label, data_value: COORDINATE
      }
    });

    const result = mergeParameterApplications(varData, bodyVariables);
    expect(result).toEqual(expected);
  });
});

describe("getRegimenVariableData()", () => {
  it("returns variable data", () => {
    const varDeclaration: VariableDeclaration = {
      kind: "variable_declaration", args: {
        label: "parent2",
        data_value: COORDINATE
      }
    };
    const paramDeclaration: ParameterDeclaration = {
      kind: "parameter_declaration", args: {
        label: "parent1",
        default_value: { kind: "coordinate", args: { x: 4, y: 5, z: 6 } }
      }
    };
    const bodyVariables: ScopeDeclarationBodyItem[] =
      [varDeclaration, paramDeclaration];
    const result = getRegimenVariableData(bodyVariables, buildResourceIndex().index);
    expect(result).toEqual({
      parent1: {
        celeryNode: paramDeclaration,
        dropdown: {
          label: "Externally defined",
          value: "?"
        },
        vector: undefined
      },
      parent2: {
        celeryNode: varDeclaration,
        dropdown: { label: "Coordinate (1, 2, 3)", value: "?" },
        vector: COORDINATE.args
      }
    });
  });
});
