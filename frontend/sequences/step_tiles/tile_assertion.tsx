import { StepParams } from "../interfaces";
import React from "react";
import { editStep } from "../../api/crud";
import { Assertion, ALLOWED_ASSERTION_TYPES } from "farmbot";
import { SequenceSelectBox } from "../sequence_select_box";
import { FBSelect, DropDownItem } from "../../ui";
import { StepHeader } from "../step_ui/step_header";

interface AssertionStepParams extends StepParams {
  currentStep: Assertion;
}

export function TileAssertion(props: StepParams) {

  const step = props.currentStep;

  if (step.kind !== "assertion") {
    throw new Error("Not an assertion");
  }
  const p = props as AssertionStepParams;

  return <div style={{ border: "2px dotted black" }}>
    <StepHeader
      className={"execute-step"}
      helpText={""}
      currentSequence={p.currentSequence}
      currentStep={p.currentStep}
      dispatch={p.dispatch}
      index={p.index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <LuaPart {...p} />
    <SequencePart {...p} />
    <TypePart {...p} />
  </div>;
}

const ASSERTION_TYPES: Record<ALLOWED_ASSERTION_TYPES, DropDownItem> = {
  "abort": {
    label: "Abort",
    value: "abort"
  },
  "recover": {
    label: "Recover",
    value: "recover"
  },
  "abort_recover": {
    label: "Abort and Recover",
    value: "abort_recover"
  },
};

function TypePart(props: AssertionStepParams) {
  const { assertion_type } = props.currentStep.args;
  return <span>Assertion Type:
    <FBSelect
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
      list={Object.values(ASSERTION_TYPES)} />;
  </span>;
}

function LuaPart(props: AssertionStepParams) {
  const luaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.dispatch(editStep({
      step: props.currentStep,
      index: props.index,
      sequence: props.currentSequence,
      executor(c: Assertion) {
        c.args.lua = e.currentTarget.value;
      }
    }));
  };
  return <span>
    Lua:
  <input value={props.currentStep.args.lua} onChange={luaChange} />
  </span>;
}

function SequencePart(props: AssertionStepParams) {
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
  return <span>
    Sequence:
  <SequenceSelectBox
      onChange={onChange}
      resources={props.resources}
      sequenceId={sequenceId} />
  </span>;
}
