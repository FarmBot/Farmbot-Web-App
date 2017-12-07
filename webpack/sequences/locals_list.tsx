import * as React from "react";
import {
  ScopeDeclaration,
  ParameterDeclaration,
  VariableDeclaration
} from "farmbot";
import { TileMoveAbsSelect } from "./step_tiles/tile_move_absolute/select";
import { InputBox } from "./step_tiles/tile_move_absolute/input_box";
import { ResourceIndex } from "../resources/interfaces";
import { t } from "i18next";

type LocalVariable = ParameterDeclaration | VariableDeclaration;

interface LocalsListProps {
  locals: ScopeDeclaration;
  resources: ResourceIndex;
  dispatch: Function;
}

export function LocalsList({ resources, locals }: LocalsListProps) {
  const parent = extractParent(locals.body);
  return parent ?
    <ParentVariableForm parent={parent} resources={resources} /> : <div />;
}

interface ParentVariableFormProps {
  parent: VariableDeclaration;
  resources: ResourceIndex;
}

const todo = () => { throw new Error("TODO: This thing."); };

function ParentVariableForm({ parent, resources }: ParentVariableFormProps) {
  return <div>
    <pre>{JSON.stringify(parent.args.data_value)}</pre>
    <h5>Import Coordinates From</h5>
    <TileMoveAbsSelect
      /** Disable `parent` from showing up in the list. */
      additionalItems={[]}
      resources={resources}
      selectedItem={parent.args.data_value}
      onChange={todo} />
    {t("X (mm)")}
    <InputBox onCommit={todo} disabled={false} name="location-x" value={"0"} />
  </div>;
}

function extractParent(list?: LocalVariable[]): VariableDeclaration | undefined {
  const p = list && list.filter(x => x.args.label === "parent")[0];
  return (p && p.kind === "variable_declaration") ? p : undefined;
}
