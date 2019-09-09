import { StepParams } from "../interfaces";
import React from "react";
import { Row, Col } from "../../ui";
import { StepHeader } from "../step_ui/step_header";
import { StepContent, StepWrapper } from "../step_ui";
import { TypePart } from "./tile_assertion/type_part";
import { LuaPart } from "./tile_assertion/lua_part";
import { SequencePart } from "./tile_assertion/sequence_part";
import { Assertion } from "farmbot/dist/corpus";

export interface AssertionStepProps extends StepParams {
  currentStep: Assertion;
}

const CLASS_NAME = "assertion-step";

export function TileAssertion(props: StepParams) {
  const step = props.currentStep;

  if (step.kind !== "assertion") { throw new Error("Not an assertion"); }

  const p = props as AssertionStepProps;

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
          <TypePart {...p} />
        </Col>
        <Col xs={6}>
          <SequencePart {...p} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
