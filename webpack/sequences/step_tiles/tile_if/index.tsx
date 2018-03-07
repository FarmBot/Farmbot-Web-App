import * as _ from "lodash";
import * as React from "react";
import { t } from "i18next";
import { DropDownItem, NULL_CHOICE } from "../../../ui/index";
import { TaggedSequence } from "../../../resources/tagged_resources";
import { If, Execute, Nothing } from "farmbot/dist";
import { ResourceIndex } from "../../../resources/interfaces";
import { selectAllSequences, findSequenceById } from "../../../resources/selectors";
import { isRecursive } from "../index";
import { If_ } from "./if";
import { Then } from "./then";
import { Else } from "./else";
import { defensiveClone, shouldDisplay } from "../../../util";
import { overwrite } from "../../../api/crud";
import { ToolTips } from "../../../constants";
import { StepWrapper, StepHeader, StepContent } from "../../step_ui/index";
import {
  sensorsAsDropDowns, peripheralsAsDropDowns, pinDropdowns
} from "../pin_and_peripheral_support";

export interface IfParams {
  currentSequence: TaggedSequence;
  currentStep: If;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  installedOsVersion?: string | undefined;
}

export type Operator = "lhs"
  | "op"
  | "rhs"
  | "_then"
  | "_else";

export const LHSOptions =
  (resources: ResourceIndex, fbosVersion: string | undefined
  ): DropDownItem[] => [
      { heading: true, label: t("Positions"), value: 0 },
      { value: "x", label: t("X position"), headingId: "Position" },
      { value: "y", label: t("Y position"), headingId: "Position" },
      { value: "z", label: t("Z position"), headingId: "Position" },
      ...(shouldDisplay("named_pins", fbosVersion) ?
        peripheralsAsDropDowns(resources) : []),
      ...(shouldDisplay("named_pins", fbosVersion) ?
        sensorsAsDropDowns(resources) : []),
      ...pinDropdowns(n => `pin${n}`),
    ];

export const operatorOptions: DropDownItem[] = [
  { value: "<", label: t("is less than") },
  { value: ">", label: t("is greater than") },
  { value: "is", label: t("is equal to") },
  { value: "not", label: t("is not equal to") },
  { value: "is_undefined", label: t("is unknown") }
];

export function seqDropDown(i: ResourceIndex) {
  const results: DropDownItem[] = [];
  selectAllSequences(i)
    .map(function (x) {
      const { body } = x;
      if (_.isNumber(body.id)) {
        results.push({ label: body.name, value: body.id });
      }
    });
  return results;
}

export function initialValue(input: Execute | Nothing, index: ResourceIndex) {
  switch (input.kind) {
    case "execute":
      const id = input.args.sequence_id;
      const seq = findSequenceById(index, id).body;
      if (_.isNumber(seq.id)) {
        return { label: seq.name, value: seq.id };
      } else {
        throw new Error("Failed seq id type assertion.");
      }
    case "nothing":
      return { label: t("None"), value: 0 };
    default:
      throw new Error("Only _else or _then");
  }
}

export function InnerIf(props: IfParams) {
  const {
    index,
    dispatch,
    currentStep,
    currentSequence
  } = props;
  const recursive = isRecursive(currentStep, currentSequence);
  const className = "if-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.IF}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}>
      {recursive && (
        <span>
          <i className="fa fa-exclamation-triangle"></i>
          &nbsp;{t("Recursive condition.")}
        </span>
      )}
    </StepHeader>
    <StepContent className={className}>
      <If_ {...props} />
      <Then {...props} />
      <Else {...props} />
    </StepContent>
  </StepWrapper>;
}

/** Creates a function that can be used in the `onChange` event of a _else or
 * _then block in the sequence editor.
 */
export let IfBlockDropDownHandler = (props: IfParams,
  key: "_else" | "_then") => {

  const { dispatch, index } = props;
  const step = props.currentStep;
  const sequence = props.currentSequence;
  const block = step.args[key];
  const selectedItem = () => {
    if (block.kind === "nothing") {
      return NULL_CHOICE;
    } else {
      const value = (block.kind === "execute") && block.args.sequence_id;
      const label = value && findSequenceById(props.resources, value).body.name;
      if (_.isNumber(value) && _.isString(label)) {
        return { label, value };
      } else {
        throw new Error("Failed type assertion");
      }
    }
  };

  function overwriteStep(input: Execute | Nothing) {
    const update = defensiveClone(step);
    const nextSequence = defensiveClone(sequence).body;
    update.args[key] = input;
    (nextSequence.body || [])[index] = update;
    dispatch(overwrite(sequence, nextSequence));
  }

  function onChange(e: DropDownItem) {
    if (e.value && _.isNumber(e.value)) {
      const v = e.value;
      overwriteStep({ kind: "execute", args: { sequence_id: v } });
    } else {
      overwriteStep({ kind: "nothing", args: {} });
    }
  }

  return { onChange, selectedItem };
};
