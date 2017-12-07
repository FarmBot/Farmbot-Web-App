import * as React from "react";
import {
  ParameterDeclaration,
  VariableDeclaration
} from "farmbot";
import { TileMoveAbsSelect } from "./step_tiles/tile_move_absolute/select";
import { ResourceIndex } from "../resources/interfaces";
import { LocationData } from "./step_tiles/tile_move_absolute/interfaces";
import { overwrite } from "../api/crud";
import { TaggedSequence } from "../resources/tagged_resources";
import { defensiveClone } from "../util";

type LocalVariable = ParameterDeclaration | VariableDeclaration;

interface LocalsListProps {
  sequence: TaggedSequence;
  resources: ResourceIndex;
  dispatch: Function;
}

export const LocalsList =
  ({ resources, sequence, dispatch }: LocalsListProps) => {
    const parent = extractParent(sequence.body.args.locals.body);
    if (parent) {
      return <ParentVariableForm
        parent={parent}
        resources={resources}
        onChange={handleVariableChange(dispatch, sequence)} />;
    } else {
      return <div />;
    }
  };

interface ParentVariableFormProps {
  parent: VariableDeclaration;
  resources: ResourceIndex;
  onChange(data_type: LocationData): void;
}

function ParentVariableForm({ parent, resources, onChange }: ParentVariableFormProps) {
  return <div>
    <pre>{JSON.stringify(parent.args.data_value.args)}</pre>
    <h5>Import Coordinates From</h5>
    <TileMoveAbsSelect
      /** Disable `parent` from showing up in the list. */
      additionalItems={[]}
      resources={resources}
      selectedItem={{
        kind: "identifier",
        args: {
          label: parent.args.data_value.kind,
          value: 0
        }
      }}
      onChange={onChange} />
  </div>;
}

const handleVariableChange =
  (dispatch: Function, sequence: TaggedSequence) => (data_value: LocationData) => {
    switch (data_value.kind) {
      case "tool":
      case "point":
      case "coordinate":
        const nextSeq: typeof sequence.body = defensiveClone(sequence.body);
        nextSeq.args.locals = {
          kind: "scope_declaration",
          args: {},
          body: [
            {
              kind: "variable_declaration",
              args: { label: "parent", data_value }
            }
          ]
        };
        return dispatch(overwrite(sequence, nextSeq));
      default:
        throw new Error("We don't support re-binding of variables yet.");
    }
  };

function extractParent(list?: LocalVariable[]): VariableDeclaration | undefined {
  const p = list && list.filter(x => x.args.label === "parent")[0];
  return (p && p.kind === "variable_declaration") ? p : undefined;
}
