import React from "react";
import { t } from "../../i18next_wrapper";
import { StepParams } from "../interfaces";
import { Row, Col, devDocLinkClick } from "../../ui";
import { StepWrapper } from "../step_ui";
import { TypePart } from "./tile_assertion/type_part";
import { SequencePart } from "./tile_assertion/sequence_part";
import { Assertion } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";
import { LuaTextArea } from "./tile_lua_support";

export const TileAssertion = (props: StepParams<Assertion>) => {
  const [monaco, setMonaco] = React.useState(window.innerWidth > 450);
  return <StepWrapper
    className={"assertion-step"}
    helpText={ToolTips.ASSERTION}
    links={[
      <a key={"lua"} onClick={devDocLinkClick("lua")}>
        {" " + t("Documentation")}
        <i className="fa fa-external-link" />
      </a>]}
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    toggleMonacoEditor={() => setMonaco(!monaco)}
    resources={props.resources}>
    <Row>
      <Col xs={12}>
        <LuaTextArea<Assertion> {...props} useMonacoEditor={monaco} />
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
};
