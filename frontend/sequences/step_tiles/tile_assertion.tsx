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
import { VariablesPart } from "./tile_assertion/variables_part";

export const TileAssertion = (props: StepParams<Assertion>) => {
  const [monaco, setMonaco] = React.useState(window.innerWidth > 450);
  return <StepWrapper {...props}
    className={"assertion-step"}
    helpText={ToolTips.ASSERTION}
    links={[
      <a key={"lua"} onClick={devDocLinkClick("lua")}>
        {" " + t("Documentation")}
        <i className="fa fa-external-link" />
      </a>]}
    monacoEditor={monaco}
    toggleMonacoEditor={() => setMonaco(!monaco)}>
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
    <VariablesPart {...props} />
  </StepWrapper>;
};
