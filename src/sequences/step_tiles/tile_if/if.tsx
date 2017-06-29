import * as React from "react";
import { IfParams, LHSOptions, operatorOptions } from "./index";
import { t } from "i18next";
import { StepInputBox } from "../../inputs/step_input_box";
import { FBSelect, NULL_CHOICE } from "../../../ui/new_fb_select";
import { DropDownItem } from "../../../ui/fb_select";
import { defensiveClone } from "../../../util";
import { overwrite } from "../../../api/crud";
import { Col } from "../../../ui/index";
import { ALLOWED_OPS } from "farmbot/dist";

const IS_UNDEFINED: ALLOWED_OPS = "is_undefined";
const label_ops: Record<ALLOWED_OPS, string> = {
  "is_undefined": "is unknown",
  ">": "is greater than",
  "<": "is less than",
  "is": "is",
  "not": "is not"
}
export function If_(props: IfParams) {
  let {
    dispatch,
    currentStep,
    index
  } = props;
  let step = props.currentStep;
  let sequence = props.currentSequence;
  let { op, lhs } = currentStep.args;
  function updateField(field: "lhs" | "op") {
    return (e: DropDownItem) => {
      let stepCopy = defensiveClone(step);
      let seqCopy = defensiveClone(sequence).body;
      let val = e.value;
      seqCopy.body = seqCopy.body || [];
      if (_.isString(val)) { stepCopy.args[field] = val; }
      seqCopy.body[index] = stepCopy;
      dispatch(overwrite(sequence, seqCopy));
    };
  }

  return <div>
    <Col xs={12}>
      <h4 className="top">IF...</h4>
    </Col>
    <Col xs={4}>
      <label>{t("Variable")}</label>
      <FBSelect
        list={LHSOptions}
        placeholder="Left hand side"
        onChange={updateField("lhs")}
        selectedItem={LHSOptions.filter(x => x.value === lhs)[0] || NULL_CHOICE}
      />
    </Col>
    <Col xs={4}>
      <label>{t("Operator")}</label>
      <FBSelect
        list={operatorOptions}
        placeholder="Operation"
        onChange={updateField("op")}
        selectedItem={{ label: label_ops[op as ALLOWED_OPS] || op, value: op }} />
    </Col>
    <Col xs={4} hidden={op === IS_UNDEFINED}>
      <label>{t("Value")}</label>
      <StepInputBox dispatch={dispatch}
        step={currentStep}
        sequence={sequence}
        index={index}
        field="rhs" />
    </Col>
  </div>;
}
