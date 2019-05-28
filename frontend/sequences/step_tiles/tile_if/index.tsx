import * as React from "react";
import { DropDownItem, NULL_CHOICE } from "../../../ui/index";
import { TaggedSequence, ParameterApplication } from "farmbot";
import { If, Execute, Nothing } from "farmbot/dist";
import { ResourceIndex } from "../../../resources/interfaces";
import {
  selectAllSequences, findSequenceById
} from "../../../resources/selectors";
import { isRecursive } from "../index";
import { If_ } from "./if";
import { ThenElse } from "./then_else";
import { defensiveClone } from "../../../util";
import { overwrite } from "../../../api/crud";
import { ToolTips } from "../../../constants";
import { StepWrapper, StepHeader, StepContent } from "../../step_ui/index";
import {
  sensorsAsDropDowns, peripheralsAsDropDowns, pinDropdowns, PinGroupName
} from "../pin_and_peripheral_support";
import { ShouldDisplay } from "../../../devices/interfaces";
import { isNumber, isString } from "lodash";
import {
  addOrEditParamApps, variableList
} from "../../locals_list/variable_support";
import { t } from "../../../i18next_wrapper";

export interface IfParams {
  currentSequence: TaggedSequence;
  currentStep: If;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  shouldDisplay?: ShouldDisplay;
  confirmStepDeletion: boolean;
  showPins?: boolean;
}

export interface ThenElseParams extends IfParams {
  thenElseKey: "_then" | "_else";
}

export type Operator = "lhs"
  | "op"
  | "rhs"
  | "_then"
  | "_else";

export const LHSOptions =
  (resources: ResourceIndex, showPins: boolean
  ): DropDownItem[] => [
      { heading: true, label: t("Positions"), value: 0, headingId: PinGroupName.Position },
      { value: "x", label: t("X position"), headingId: "Position" },
      { value: "y", label: t("Y position"), headingId: "Position" },
      { value: "z", label: t("Z position"), headingId: "Position" },
      ...peripheralsAsDropDowns(resources),
      ...sensorsAsDropDowns(resources),
      ...(showPins ? pinDropdowns(n => `pin${n}`) : []),
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
      if (isNumber(body.id)) {
        results.push({ label: body.name, value: body.id });
      }
    });
  return results;
}

export function InnerIf(props: IfParams) {
  const {
    index,
    dispatch,
    currentStep,
    currentSequence,
    confirmStepDeletion,
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
      index={index}
      confirmStepDeletion={confirmStepDeletion}>
      {recursive &&
        <span>
          <i className="fa fa-exclamation-triangle"></i>
          &nbsp;{t("Recursive condition.")}
        </span>
      }
    </StepHeader>
    <StepContent className={className}>
      <If_ {...props} />
      <ThenElse thenElseKey={"_then"} {...props} />
      <ThenElse thenElseKey={"_else"} {...props} />
    </StepContent>
  </StepWrapper>;
}

/** Creates a function that can be used in the `onChange` event of a _else or
 * _then block in the sequence editor.
 */
export let IfBlockDropDownHandler = (props: ThenElseParams) => {

  const { dispatch, index, thenElseKey } = props;
  const step = props.currentStep;
  const sequence = props.currentSequence;
  const block = step.args[thenElseKey];
  const selectedItem = () => {
    if (block.kind === "nothing") {
      return NULL_CHOICE;
    } else {
      const value = (block.kind === "execute") && block.args.sequence_id;
      const label = value && findSequenceById(props.resources, value).body.name;
      if (isNumber(value) && isString(label)) {
        return { label, value };
      } else {
        throw new Error("Failed type assertion");
      }
    }
  };

  function overwriteStep(input: Execute | Nothing) {
    const update = defensiveClone(step);
    const nextSequence = defensiveClone(sequence).body;
    update.args[thenElseKey] = input;
    (nextSequence.body || [])[index] = update;
    dispatch(overwrite(sequence, nextSequence));
  }

  function onChange(e: DropDownItem) {
    if (e.value && isNumber(e.value)) {
      const v = e.value;
      const uuid = findSequenceById(props.resources, v).uuid;
      const body = variableList(props.resources.sequenceMetas[uuid]);
      overwriteStep({ kind: "execute", args: { sequence_id: v }, body });
    } else {
      overwriteStep({ kind: "nothing", args: {} });
    }
  }

  const sequenceId = selectedItem().value;
  const calleeUuid = sequenceId ?
    findSequenceById(props.resources, sequenceId).uuid : undefined;
  const calledSequenceVariableData = calleeUuid ?
    props.resources.sequenceMetas[calleeUuid] : undefined;

  /** Replaces the execute step body with a new array of bodyVariables. */
  const assignVariable = (bodyVariables: ParameterApplication[]) =>
    (variable: ParameterApplication) => {
      block.body = addOrEditParamApps(bodyVariables, variable);
      overwriteStep(block);
    };

  return { onChange, selectedItem, calledSequenceVariableData, assignVariable };
};
