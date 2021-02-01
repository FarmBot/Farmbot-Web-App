import React from "react";
import { StepParams } from "../interfaces";
import { Row, Col } from "../../ui";
import { StepWrapper } from "../step_ui";
import { Lua } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";
import { LuaTextArea } from "./tile_lua_support";

export const TileLua = (props: StepParams<Lua>) => {
  const [monaco, setMonaco] = React.useState(true);
  return <StepWrapper
    className={"lua-step"}
    helpText={ToolTips.LUA}
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    toggleMonacoEditor={() => setMonaco(!monaco)}
    resources={props.resources}>
    <Row>
      <Col xs={12}>
        <LuaTextArea<Lua> {...props} useMonacoEditor={monaco} />
      </Col>
    </Row>
  </StepWrapper>;
};
