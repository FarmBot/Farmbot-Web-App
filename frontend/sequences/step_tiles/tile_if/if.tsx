import * as React from "react";
import { IfParams, LHSOptions, operatorOptions } from "./index";
import { StepInputBox } from "../../inputs/step_input_box";
import { defensiveClone } from "../../../util";
import { overwrite } from "../../../api/crud";
import { Col, Row, FBSelect, DropDownItem } from "../../../ui";
import { ALLOWED_OPS } from "farmbot/dist";
import { updateLhs } from "./update_lhs";
import { displayLhs } from "./display_lhs";
import { isString } from "lodash";
import { t } from "../../../i18next_wrapper";

const IS_UNDEFINED: ALLOWED_OPS = "is_undefined";
const label_ops: Record<ALLOWED_OPS, string> = {
  "is_undefined": t("is unknown"),
  ">": t("is greater than"),
  "<": t("is less than"),
  "is": t("is"),
  "not": t("is not")
};

// tslint:disable-next-line:no-any
const isOp = (x: any): x is ALLOWED_OPS => Object.keys(label_ops).includes(x);

const updateOp = (props: IfParams) => (ddi: DropDownItem) => {
  const stepCopy = defensiveClone(props.currentStep);
  const seqCopy = defensiveClone(props.currentSequence).body;
  const val = ddi.value;
  seqCopy.body = seqCopy.body || [];
  if (isString(val) && isOp(val)) { stepCopy.args.op = val; }
  seqCopy.body[props.index] = stepCopy;
  props.dispatch(overwrite(props.currentSequence, seqCopy));
};

export function If_(props: IfParams) {
  const { currentStep, resources } = props;
  const sequence = props.currentSequence;
  const { op } = currentStep.args;
  const lhsOptions = LHSOptions(resources, !!props.showPins);

  return <Row>
    <Col xs={12}>
      <h4 className="top">{t("IF...")}</h4>
    </Col>
    <Col xs={4}>
      <label>{t("Variable")}</label>
      <FBSelect
        key={JSON.stringify(sequence)}
        list={lhsOptions}
        onChange={updateLhs(props)}
        selectedItem={displayLhs({ currentStep, resources, lhsOptions })} />
    </Col>
    <Col xs={4}>
      <label>{t("Operator")}</label>
      <FBSelect
        key={JSON.stringify(sequence)}
        list={operatorOptions}
        onChange={updateOp(props)}
        selectedItem={{ label: label_ops[op] || op, value: op }} />
    </Col>
    <Col xs={4} hidden={op === IS_UNDEFINED}>
      <label>{t("Value")}</label>
      <StepInputBox dispatch={props.dispatch}
        step={currentStep}
        sequence={sequence}
        index={props.index}
        field="rhs" />
    </Col>
  </Row>;
}
