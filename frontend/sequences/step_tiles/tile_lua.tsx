import React from "react";
import { StepParams } from "../interfaces";
import { Row, Col } from "../../ui";
import { StepWrapper } from "../step_ui";
import { Lua } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";
import { editStep } from "../../api/crud";


export const TileLua = (props: StepParams<Lua>) => {
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.dispatch(editStep({
      step: props.currentStep,
      index: props.index,
      sequence: props.currentSequence,
      executor(c: Lua) { c.args.lua = e.currentTarget.value; }
    }));
  };
  const { lua } = props.currentStep.args;
  return <StepWrapper
    className={"lua-step"}
    helpText={ToolTips.LUA}
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    resources={props.resources}>
    <Row>
      <Col xs={12}>
        <div className={"lua"}>
          <textarea value={lua} onChange={onChange} />
        </div>
      </Col>
    </Row>
  </StepWrapper>;
};
