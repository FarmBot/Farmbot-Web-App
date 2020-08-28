import React from "react";
import { StepParams } from "../interfaces";
import { Row, Col } from "../../ui";
import { StepWrapper } from "../step_ui";
import { TypePart } from "./tile_assertion/type_part";
import { LuaPart } from "./tile_assertion/lua_part";
import { SequencePart } from "./tile_assertion/sequence_part";
import { Assertion } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";

export const TileAssertion = (props: StepParams<Assertion>) =>
  <StepWrapper
    className={"assertion-step"}
    helpText={ToolTips.ASSERTION}
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    resources={props.resources}>
    <Row>
      <Col xs={12}>
        <LuaPart {...props} />
      </Col>
    </Row>
    <Row>
      <Col xs={6}>
        <TypePart key={JSON.stringify(props.currentSequence)}
          {...props} />
      </Col>
      {props.currentStep.args.assertion_type.includes("recover") &&
        <Col xs={6}>
          <SequencePart key={JSON.stringify(props.currentSequence)}
            {...props} />
        </Col>}
    </Row>
  </StepWrapper>;
