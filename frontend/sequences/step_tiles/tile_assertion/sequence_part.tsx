import { DropDownItem } from "../../../ui/fb_select";
import { editStep } from "../../../api/crud";
import { Assertion } from "farmbot/dist/corpus";
import React from "react";
import { SequenceSelectBox } from "../../sequence_select_box";
import { AssertionStepProps } from "../tile_assertion";
import { t } from "../../../i18next_wrapper";

export function SequencePart(props: AssertionStepProps) {
  const onChange = (ddi: DropDownItem) => props.dispatch(editStep({
    step: props.currentStep,
    index: props.index,
    sequence: props.currentSequence,
    executor(c: Assertion) {
      c.args._then = {
        kind: "execute",
        args: { sequence_id: ddi.value as number }
      };
    }
  }));

  let sequenceId: number | undefined;
  const { _then } = props.currentStep.args;
  if (_then.kind == "execute") {
    sequenceId = _then.args.sequence_id;
  }
  return <span className="assertion-sequence">
    <label>{t("Recovery Sequence")}</label>
    <SequenceSelectBox
      key={JSON.stringify(props.currentStep)}
      onChange={onChange}
      resources={props.resources}
      sequenceId={sequenceId} />
  </span>;
}
