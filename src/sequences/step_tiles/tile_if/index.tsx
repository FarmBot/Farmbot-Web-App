import * as _ from "lodash";
import * as React from "react";
import { t } from "i18next";
import { DropDownItem, Help } from "../../../ui";
import { TaggedSequence } from "../../../resources/tagged_resources";
import { If, Execute, Nothing } from "farmbot/dist";
import { ResourceIndex } from "../../../resources/interfaces";
import { selectAllSequences, findSequenceById } from "../../../resources/selectors";
import { splice, remove, isRecursive } from "../index";
import { StepTitleBar } from "../step_title_bar";
import { If_ } from "./if";
import { Then } from "./then";
import { Else } from "./else";
import { defensiveClone } from "../../../util";
import { overwrite } from "../../../api/crud";
import { NULL_CHOICE } from "../../../ui/fb_select";
import { range } from "lodash";
import { ToolTips } from "../../../constants";

export interface IfParams {
  currentSequence: TaggedSequence;
  currentStep: If;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}

export type Operator = "lhs"
  | "op"
  | "rhs"
  | "_then"
  | "_else";

export const LHSOptions: DropDownItem[] = [
  { value: "x", label: "X position" },
  { value: "y", label: "Y Position" },
  { value: "z", label: "Z position" }
].concat(range(0, 70).map(x => ({ value: `pin${x}`, label: `Pin ${x}` })))

export const operatorOptions: DropDownItem[] = [
  { value: "<", label: "is less than" },
  { value: ">", label: "is greater than" },
  { value: "is", label: "is equal to" },
  { value: "not", label: "is not equal to" },
  { value: "is_undefined", label: "is unknown" }
];

export function seqDropDown(i: ResourceIndex) {
  let results: DropDownItem[] = [];
  selectAllSequences(i)
    .map(function (x) {
      let { body } = x;
      if (_.isNumber(body.id)) {
        results.push({ label: body.name, value: body.id });
      }
    })
  return results;
}

export function initialValue(input: Execute | Nothing, index: ResourceIndex) {
  switch (input.kind) {
    case "execute":
      let id = input.args.sequence_id;
      let seq = findSequenceById(index, id).body;
      if (_.isNumber(seq.id)) {
        return { label: seq.name, value: seq.id }
      } else {
        throw new Error("Failed seq id type assertion.")
      }
    case "nothing":
      return { label: "None", value: 0 }
    default:
      throw new Error("Only _else or _then");
  }
}

export function InnerIf(props: IfParams) {
  let {
    index,
    dispatch,
    currentStep,
    currentSequence
  } = props;
  let stuff = { dispatch, step: currentStep, sequence: currentSequence, index };
  let recursive = isRecursive(currentStep, currentSequence);
  return <div>
    <div className="step-wrapper">
      <div className="row">
        <div className="col-sm-12">
          <div className="step-header if-step">
            <StepTitleBar index={index}
              dispatch={dispatch}
              step={currentStep} />
            <i className="fa fa-arrows-v step-control" />
            <i className="fa fa-clone step-control"
              onClick={() => splice(stuff)} />
            <i className="fa fa-trash step-control"
              onClick={() => remove(stuff)} />
            <Help text={t(ToolTips.IF)} />
            {recursive && (
              <span>
                <i className="fa fa-exclamation-triangle"></i>
                &nbsp;Recursive condition.
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="step-content if-step">
            <div className="row">
              <If_ {...props} />
              <Then {...props} />
              <Else {...props} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/** Creates a function that can be used in the `onChange` event of a _else or
 * _then block in the sequence editor.
 */
export let IfBlockDropDownHandler = (props: IfParams,
  key: "_else" | "_then") => {

  let { dispatch, currentSequence, currentStep, index } = props;
  let step = props.currentStep;
  let sequence = props.currentSequence;
  let block = step.args[key];
  let selectedItem = () => {
    if (block.kind === "nothing") {
      return NULL_CHOICE;
    } else {
      let value = (block.kind === "execute") && block.args.sequence_id;
      let label = value && findSequenceById(props.resources, value).body.name;
      if (_.isNumber(value) && _.isString(label)) {
        return { label, value }
      } else {
        throw new Error("Failed type assertion");
      }
    }
  };

  function overwriteStep(input: Execute | Nothing) {
    let update = defensiveClone(step);
    let nextSequence = defensiveClone(sequence).body;
    update.args[key] = input;
    (nextSequence.body || [])[index] = update;
    dispatch(overwrite(sequence, nextSequence));
  }

  function onChange(e: DropDownItem) {
    if (e.value) {
      let v = _.isNumber(e.value) && e.value;
      v && overwriteStep({ kind: "execute", args: { sequence_id: v } })
    } else {
      overwriteStep({ kind: "nothing", args: {} });
    }
  };

  return { onChange, selectedItem };
}
