import {
  ParameterDeclaration,
  VariableDeclaration,
  Vector3,
  ScopeDeclarationBodyItem
} from "farmbot";
import { ResourceIndex, VariableNameSet } from "../resources/interfaces";
import {
  LocationData,
  CeleryVariable
} from "./step_tiles/tile_move_absolute/index";
import { overwrite } from "../api/crud";
import { TaggedSequence } from "farmbot";
import { defensiveClone } from "../util";
import { isNaN } from "lodash";
import { findSlotByToolId } from "../resources/selectors_by_id";

type OnChange = (data_type: LocationData | ParameterDeclaration) => void;
type DataValue = VariableDeclaration["args"]["data_value"];
type ParentType = ParameterDeclaration | VariableDeclaration;

export interface LocalsListProps {
  varialbleData: VariableNameSet;
  deprecatedSequence: TaggedSequence;
  deprecatedResources: ResourceIndex;
  dispatch: Function;
}

export interface ParentVariableFormProps {
  parent: VariableDeclaration | ParameterDeclaration;
  sequence: TaggedSequence;
  resources: ResourceIndex;
  onChange: OnChange;
}

export const PARENT =
  ({ value: "parent", label: "Parent", headingId: "parameter" });

/** Return this when unable to correctly guess coordinate values */
const EMPTY_VEC3 = { x: 0, y: 0, z: 0 };

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

/** Returns the event handler that gets called when you edit the X/Y/Z*/
export const handleVariableChange =
  (dispatch: Function, sequence: TaggedSequence) =>
    (data_value: LocationData) =>
      dispatch(overwrite(sequence, setParent(sequence, data_value)));

/** Callback generator called when user changes the x/y/z of a variable in the
 * sequence generator. */
export const changeAxis =
  (axis: keyof Vector3, onChange: OnChange, data_type: LocationData) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      if (data_type.kind === "coordinate") {
        const nextDT = defensiveClone(data_type);
        nextDT.args[axis] = parseInt(e.currentTarget.value, 10);
        onChange(nextDT);
      } else {
        throw new Error("Never not coord");
      }
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

const maybeFetchToolCoords =
  (data_value: DataValue, resources: ResourceIndex): Vector3 | undefined => {
    if (data_value.kind === "tool") {
      const r = findSlotByToolId(resources, data_value.args.tool_id);
      return r && r.body;
    }
  };

const guessVariable = (label: string,
  local: VariableDeclaration,
  resources: ResourceIndex): Vector3 => {

  return guessVecFromLabel(label) ||
    guessFromDataType(local.args.data_value) ||
    maybeFetchToolCoords(local.args.data_value, resources) ||
    EMPTY_VEC3;
};

/** Given a dropdown label and a local variable declaration, tries to guess the
* X/Y/Z value of the declared variable. If unable to guess,
* returns (0, 0, 0) */
export const guessXYZ =
  (label: string, local: ParentType, resources: ResourceIndex): Vector3 => {
    return (local.kind === "variable_declaration") ?
      guessVariable(label, local, resources) : EMPTY_VEC3;
  };
