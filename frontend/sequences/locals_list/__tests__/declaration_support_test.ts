import {
  declarationList, mergeVariableDeclarations, getRegimenVariableData
} from "../declaration_support";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import {
  VariableDeclaration, ParameterDeclaration, ScopeDeclarationBodyItem
} from "farmbot";
import { cloneDeep } from "lodash";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { NOTHING_SELECTED } from "../handle_select";

const coordinateVar = (label: string): VariableDeclaration =>
  ({
    kind: "variable_declaration", args: {
      label, data_value: {
        kind: "coordinate", args: { x: 1, y: 2, z: 3 }
      }
    }
  });

describe("declarationList()", () => {
  it("returns undefined", () => {
    const result = declarationList(undefined);
    expect(result).toEqual(undefined);
  });

  it("returns variable declarations", () => {
    const result = declarationList({
      parent1: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent1", data_type: "point"
          }
        },
        dropdown: { label: "Parent1", value: "parent1" },
        vector: undefined,
      },
      parent2: {
        celeryNode: coordinateVar("parent2"),
        dropdown: { label: "Parent2", value: "parent2" },
        vector: { x: 1, y: 2, z: 3 },
      }
    });
    expect(result).toEqual([{
      kind: "variable_declaration",
      args: { label: "parent1", data_value: NOTHING_SELECTED }
    }]);
  });
});

describe("mergeVariableDeclarations()", () => {
  const declarations: VariableDeclaration[] = [
    coordinateVar("parent1"),
    coordinateVar("parent2"),
  ];

  it("doesn't overwrite declarations", () => {
    const varData = fakeVariableNameSet("parent1");
    const result = mergeVariableDeclarations(varData, declarations);
    expect(result).toEqual(declarations);
  });

  it("adds new declarations", () => {
    // "parent2" will not be added: already exists
    const varData = fakeVariableNameSet("parent2");

    // "parent3" will not be added: already defined
    const notAdded = "parent3";
    varData[notAdded] = fakeVariableNameSet(notAdded)[notAdded];

    // "parent4" will be added to the existing declarations
    const label = "parent4";
    const add = fakeVariableNameSet(label)[label];
    const addedNewDecl: ParameterDeclaration = {
      kind: "parameter_declaration", args: { label, data_type: "point" }
    };
    add && (add.celeryNode = addedNewDecl);
    varData[label] = add;
    const expected = cloneDeep(declarations);
    expected.push({
      kind: "variable_declaration", args: {
        label, data_value: NOTHING_SELECTED
      }
    });

    const result = mergeVariableDeclarations(varData, declarations);
    expect(result).toEqual(expected);
  });
});

describe("getRegimenVariableData()", () => {
  it("returns variable data", () => {
    const declarations: ScopeDeclarationBodyItem[] = [
      coordinateVar("parent2"),
      {
        kind: "parameter_declaration", args: {
          label: "parent1", data_type: "point"
        }
      },
    ];
    const result = getRegimenVariableData(declarations, buildResourceIndex().index);
    expect(result).toEqual({
      parent1: {
        celeryNode: {
          kind: "parameter_declaration",
          args: { label: "parent1", data_type: "point" }
        },
        dropdown: { label: "Parent1", value: "?" },
        vector: undefined
      },
      parent2: {
        celeryNode: coordinateVar("parent2"),
        dropdown: { label: "Coordinate (1, 2, 3)", value: "?" },
        vector: { x: 1, y: 2, z: 3 }
      }
    });
  });
});
