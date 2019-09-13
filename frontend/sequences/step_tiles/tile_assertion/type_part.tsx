import React from "react";
import { ALLOWED_ASSERTION_TYPES, Assertion } from "farmbot";
import { DropDownItem, FBSelect } from "../../../ui";
import { editStep } from "../../../api/crud";
import { AssertionStepProps } from "../tile_assertion";
import { t } from "../../../i18next_wrapper";

const ASSERTION_TYPES: Record<ALLOWED_ASSERTION_TYPES, DropDownItem> = {
  "continue": { label: t("Continue"), value: "continue" },
  "recover": { label: t("Recover and continue"), value: "recover" },
  "abort_recover": { label: t("Abort and recover"), value: "abort_recover" },
  "abort": { label: t("Abort"), value: "abort" },
};

export function TypePart(props: AssertionStepProps) {
  const { assertion_type } = props.currentStep.args;
  return <span className="assertion-type">
    <label>{t("If Test Fails")}</label>
    <FBSelect
      key={JSON.stringify(props.currentStep)}
      selectedItem={ASSERTION_TYPES[assertion_type]}
      onChange={(ddi) => {
        props.dispatch(editStep({
          step: props.currentStep,
          index: props.index,
          sequence: props.currentSequence,
          executor(c: Assertion) {
            c.args.assertion_type = ddi.value as ALLOWED_ASSERTION_TYPES;
          }
        }));
      }}
      list={Object.values(ASSERTION_TYPES)} />
  </span>;
}
