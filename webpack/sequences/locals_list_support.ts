import {
  ParameterDeclaration,
  VariableDeclaration,
  Vector3,
  ScopeDeclarationBodyItem
} from "farmbot";
import { ResourceIndex, VariableNameSet } from "../resources/interfaces";
import { CeleryVariable } from "./step_tiles/tile_move_absolute/index";
import { TaggedSequence } from "farmbot";
import { defensiveClone } from "../util";
import { isNaN } from "lodash";
import { SequenceMeta } from "../resources/sequence_meta";

type OnChange = (data_type: Vector3) => void;
type DataValue = VariableDeclaration["args"]["data_value"];

export interface LocalsListProps {
  variableData: VariableNameSet;
  deprecatedSequence: TaggedSequence;
  deprecatedResources: ResourceIndex;
  dispatch: Function;
}

export interface ParentVariableFormProps {
  betterParent: SequenceMeta;
  deprecatedParent: VariableDeclaration | ParameterDeclaration;
  sequence: TaggedSequence;
  resources: ResourceIndex;
  onChange: OnChange;
}

export const PARENT =
  ({ value: "parent", label: "Parent", headingId: "parameter" });

const KINDS = ["parameter_declaration", "variable_declaration"];
/** Given an array of variable declarations (or undefined), finds the "parent"
 * special identifier */
export const extractParent =
  (list?: ScopeDeclarationBodyItem[]): ScopeDeclarationBodyItem | undefined => {
    const p = (list ? list : []).filter(x => {
      const isParent = x.args.label === "parent";
      const isVar = KINDS.includes(x.kind);
      return isVar && isParent;
    })[0];
    switch (p && p.kind) {
      case "variable_declaration":
      case "parameter_declaration":
        return p;
      default:
        return undefined;
    }
  };

/** Takes a sequence and data_value. Turn the data_value into the sequence's new
 * `parent` variable. This is a _pure function_. */
export const setParent =
  (sequence: TaggedSequence, data_value: CeleryVariable) => {
    const nextSeq: typeof sequence.body = defensiveClone(sequence.body);
    switch (data_value.kind) {
      case "tool":
      case "point":
      case "coordinate":
        nextSeq.args.locals = {
          kind: "scope_declaration",
          args: {},
          body: [
            {
              kind: "variable_declaration",
              args: {
                label: "parent",
                data_value
              }
            }
          ]
        };
        break;
      case "parameter_declaration":
        nextSeq.args.locals = {
          kind: "scope_declaration",
          args: {},
          body: [{
            kind: "parameter_declaration",
            args: { label: "parent", data_type: "point" }
          }]
        };
        break;
      default:
        throw new Error("Bad kind in setParent(): " + data_value.kind);
    }
    return nextSeq;
  };

/** If variable is a coordinate, just use the coordinates. */
export const guessFromDataType =
  (x: DataValue): Vector3 | undefined => (x.kind === "coordinate") ?
    x.args : undefined;

/** GLORIOUS hack: We spend a *lot* of time in the sequence editor looking up
* resource x/y/z. It's resource intensive and often hard to understand.
* Instead of adding more selectors and complexity, we make a "best effort"
* attempt to read the resource's `x`, `y`, `z` that are cached (as strings)
* in the drop down label.
*
* String manipulation is bad, but I think it is warranted here: */
export const guessVecFromLabel =
  (label: string): Vector3 | undefined => {
    const step1 = label
      .trim()
      .replace(")", "")
      .replace(/^\s+|\s+$/g, "")
      .split(/\(|\,/);
    const vec = step1
      .slice(Math.max(step1.length - 3, 1))
      .map(x => parseInt(x, 10))
      .filter(x => !isNaN(x));

    return (vec.length === 3) ?
      { x: vec[0], y: vec[1], z: vec[2] } : undefined;
  };
