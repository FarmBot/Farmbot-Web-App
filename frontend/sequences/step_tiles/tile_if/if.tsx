import React from "react";
import { LHSOptions, operatorOptions } from "./index";
import { StepInputBox } from "../../inputs/step_input_box";
import { defensiveClone } from "../../../util";
import { overwrite } from "../../../api/crud";
import { Row, FBSelect, DropDownItem } from "../../../ui";
import { ALLOWED_OPS, If } from "farmbot";
import { updateLhs } from "./update_lhs";
import { displayLhs } from "./display_lhs";
import { isString } from "lodash";
import { t } from "../../../i18next_wrapper";
import { StepParams } from "../../interfaces";

const IS_UNDEFINED: ALLOWED_OPS = "is_undefined";
const label_ops = (): Record<ALLOWED_OPS, string> => ({
  "is_undefined": t("is unknown"),
  ">": t("is greater than"),
  "<": t("is less than"),
  "is": t("is"),
  "not": t("is not")
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isOp = (x: any): x is ALLOWED_OPS =>
  Object.keys(label_ops()).includes(x as string);

const updateOp = (props: StepParams<If>) => (ddi: DropDownItem) => {
  const stepCopy = defensiveClone(props.currentStep);
  const seqCopy = defensiveClone(props.currentSequence).body;
  const val = ddi.value;
  seqCopy.body = seqCopy.body || [];
  if (isString(val) && isOp(val)) { stepCopy.args.op = val; }
  seqCopy.body[props.index] = stepCopy;
  props.dispatch(overwrite(props.currentSequence, seqCopy));
};

export function If_(props: StepParams<If>) {
  const { currentStep, resources } = props;
  const sequence = props.currentSequence;
  const { op } = currentStep.args;
  const lhsOptions = LHSOptions(resources, !!props.showPins);

  return <Row className="grid-3-col">
    <div>
      <label>{t("Variable")}</label>
      <FBSelect
        key={JSON.stringify(sequence)}
        list={lhsOptions}
        onChange={updateLhs(props)}
        selectedItem={displayLhs({ currentStep, resources, lhsOptions })} />
    </div>
    <div>
      <label>{t("Operator")}</label>
      <FBSelect
        key={JSON.stringify(sequence)}
        list={operatorOptions()}
        onChange={updateOp(props)}
        selectedItem={{ label: label_ops()[op] || op, value: op }} />
    </div>
    <div hidden={op === IS_UNDEFINED}>
      <label>{t("Value")}</label>
      <StepInputBox dispatch={props.dispatch}
        step={currentStep}
        sequence={sequence}
        index={props.index}
        field="rhs" />
    </div>
  </Row>;
}
