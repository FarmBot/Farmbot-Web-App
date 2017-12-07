import * as React from "react";
import {
  ParameterDeclaration,
  VariableDeclaration,
  Vector3
} from "farmbot";
import { ResourceIndex } from "../resources/interfaces";
import { LocationData } from "./step_tiles/tile_move_absolute/interfaces";
import { overwrite } from "../api/crud";
import { TaggedSequence } from "../resources/tagged_resources";
import { defensiveClone } from "../util";
import { Row } from "../ui/row";
import { Col } from "../ui/index";
import { InputBox } from "./step_tiles/tile_move_absolute/input_box";
import { t } from "i18next";
import { generateList } from "./step_tiles/tile_move_absolute/generate_list";
import { formatSelectedDropdown } from "./step_tiles/tile_move_absolute/format_selected_dropdown";
import { handleSelect } from "./step_tiles/tile_move_absolute/handle_select";
import { FBSelect } from "../ui/new_fb_select";
import { isNaN } from "lodash";

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

const todo = () => new Error("Not yet done.");

/** TODO: Write amazing unit tests for this. */
function guessVecFromLabel(label: string): Vector3 | undefined {
  const step1 = label
    .trim()
    .replace(")", "")
    .replace(/^\s+|\s+$/g, "")
    .split(/\(|\,/);
  const vec = step1
    .slice(Math.max(step1.length - 3, 1))
    .map(x => parseInt(x, 10))
    .filter(x => !isNaN(x));
  if (vec.length === 3) {
    return { x: vec[0], y: vec[0], z: vec[0] };
  }

}

function guessXYZ(label: string): Vector3 {
  /** GLORIOUS hack: We spend a *lot* of time in the sequence editor looking up
   * resource x/y/z. It's resource intensive and often hard to understand.
   * Instead of adding more selectors and complexity, we make a "best effort"
   * attempt to read the resource's `x`, `y`, `z` that are cached (as strings)
   * in the drop down label.
   *
   * String manipulation is bad, but I think it is warranted here: */

  /** Atempt 1: Try to pull x/y/z out of label to
   * avoid traversing resource index */
  const attempt1 = guessVecFromLabel(label);
  if (attempt1) {
    return attempt1;
  }
  return { x: 0, y: 0, z: 0 };
}
function ParentVariableForm({ parent, resources, onChange }: ParentVariableFormProps) {
  const { data_value } = parent.args;
  const ddiLabel = formatSelectedDropdown(resources, data_value);
  const { x, y, z } = guessXYZ(ddiLabel.label);
  return <div>
    <br /> {/** Lol */}
    <h5>Import Coordinates From</h5>
    <FBSelect
      allowEmpty={false}
      list={generateList(resources, [])}
      selectedItem={ddiLabel}
      onChange={(ddi) => onChange(handleSelect(resources, ddi))} />
    <br /> {/** Lol */}
    <Row>
      <Col xs={4}>
        <InputBox
          onCommit={todo}
          disabled={true}
          name="location-x-variabledeclr"
          value={"" + x}>
          {t("X (mm)")}
        </InputBox>
      </Col>
      <Col xs={4}>
        <InputBox
          onCommit={todo}
          disabled={true}
          name="location-y-variabledeclr"
          value={"" + y}>
          {t("Y (mm)")}
        </InputBox>
      </Col>
      <Col xs={4}>
        <InputBox
          onCommit={todo}
          name="location-z-variabledeclr"
          disabled={true}
          value={"" + z}>
          {t("Z (mm)")}
        </InputBox>
      </Col>
    </Row>
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
