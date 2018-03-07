import * as _ from "lodash";
import * as React from "react";
import { IfParams, LHSOptions, operatorOptions } from "./index";
import { t } from "i18next";
import { StepInputBox } from "../../inputs/step_input_box";
import { defensiveClone } from "../../../util";
import { overwrite } from "../../../api/crud";
import {
  Col, Row, FBSelect, DropDownItem, NULL_CHOICE
} from "../../../ui/index";
import { ALLOWED_OPS } from "farmbot/dist";

const IS_UNDEFINED: ALLOWED_OPS = "is_undefined";
const label_ops: Record<ALLOWED_OPS, string> = {
  "is_undefined": t("is unknown"),
  ">": t("is greater than"),
  "<": t("is less than"),
  "is": t("is"),
  "not": t("is not")
};

export function If_(props: IfParams) {
  const {
    dispatch,
    currentStep,
    index,
    installedOsVersion,
  } = props;
  const step = props.currentStep;
  const sequence = props.currentSequence;
  const { op, lhs } = currentStep.args;
  function updateField(field: "lhs" | "op") {
    return (e: DropDownItem) => {
      const stepCopy = defensiveClone(step);
      const seqCopy = defensiveClone(sequence).body;
      const val = e.value;
      seqCopy.body = seqCopy.body || [];
      if (_.isString(val)) { stepCopy.args[field] = val; }
      seqCopy.body[index] = stepCopy;
      dispatch(overwrite(sequence, seqCopy));
    };
  }

  const lhsOptions = LHSOptions(props.resources, installedOsVersion);

  return <Row>
    <Col xs={12}>
      <h4 className="top">{t("IF...")}</h4>
    </Col>
    <Col xs={4}>
      <label>{t("Variable")}</label>
      <FBSelect
        list={lhsOptions}
        placeholder="Left hand side"
        onChange={updateField("lhs")}
        selectedItem={lhsOptions
          .filter(x => x.value === lhs)[0] || NULL_CHOICE} />
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
  </Row>;
}
