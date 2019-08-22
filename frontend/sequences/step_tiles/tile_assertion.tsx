import { StepParams } from "../interfaces";
import React from "react";
import { editStep } from "../../api/crud";
import { Assertion, ALLOWED_ASSERTION_TYPES } from "farmbot";
import { SequenceSelectBox } from "../sequence_select_box";
import { FBSelect, DropDownItem, Row, Col } from "../../ui";
import { StepHeader } from "../step_ui/step_header";
import { StepContent, StepWrapper } from "../step_ui";

interface AssertionStepParams extends StepParams {
  currentStep: Assertion;
}

const CLASS_NAME = "send-message-step";

const ASSERTION_TYPES: Record<ALLOWED_ASSERTION_TYPES, DropDownItem> = {
  "abort": { label: "Abort", value: "abort" },
  "recover": { label: "Recover", value: "recover" },
  "abort_recover": { label: "Abort and Recover", value: "abort_recover" },
  "continue": { label: "Continue", value: "continue" },
};

function TypePart(props: AssertionStepParams) {
  const { assertion_type } = props.currentStep.args;
  return <span>If Test Fails:
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
  const luaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.dispatch(editStep({
      step: props.currentStep,
      index: props.index,
      sequence: props.currentSequence,
      executor(c: Assertion) {
        c.args.lua = e.currentTarget.value;
      }
    }));
  };
  return <div>
    <textarea
      value={props.currentStep.args.lua}
      onChange={luaChange}
      style={{ width: "100%" }} />
  </div>;
}

export function TileAssertion(props: StepParams) {
  const step = props.currentStep;

  if (step.kind !== "assertion") { throw new Error("Not an assertion"); }

  const p = props as AssertionStepParams;

  return <StepWrapper>
    <StepHeader
      className={CLASS_NAME}
      helpText={""}
      currentSequence={p.currentSequence}
      currentStep={p.currentStep}
      dispatch={p.dispatch}
      index={p.index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={CLASS_NAME}>
      <Row>
        <Col xs={12}>
          <LuaPart {...p} />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <SequencePart {...p} />
        </Col>
        <Col xs={6}>
          <TypePart {...p} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
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
    Recovery Sequence:
  <SequenceSelectBox
      onChange={onChange}
      resources={props.resources}
      sequenceId={sequenceId} />
  </span>;
}
