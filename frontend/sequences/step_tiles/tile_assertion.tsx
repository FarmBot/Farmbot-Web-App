import React from "react";
import { t } from "../../i18next_wrapper";
import { StepParams } from "../interfaces";
import { Row, devDocLinkClick } from "../../ui";
import { StateToggleKey, StepWrapper } from "../step_ui";
import { TypePart } from "./tile_assertion/type_part";
import { SequencePart } from "./tile_assertion/sequence_part";
import { Assertion } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";
import { LuaTextArea } from "./tile_lua_support";
import { VariablesPart } from "./tile_assertion/variables_part";
import { isMobile } from "../../screen_size";
import { useNavigate } from "react-router";

export const TileAssertion = (props: StepParams<Assertion>) => {
  const [monaco, setMonaco] = React.useState(!isMobile());
  const [expanded, setExpanded] = React.useState(false);
  const stateToggles = {
    [StateToggleKey.monacoEditor]:
      { enabled: monaco, toggle: () => setMonaco(!monaco) },
    [StateToggleKey.luaExpanded]:
      { enabled: expanded, toggle: () => setExpanded(!expanded) },
  };
  const navigate = useNavigate();
  return <StepWrapper {...props}
    className={"assertion-step"}
    helpText={ToolTips.ASSERTION}
    links={[
      <a key={"lua"} onClick={devDocLinkClick({
        slug: "lua",
        navigate,
        dispatch: props.dispatch,
      })}>
        {" " + t("Documentation")}
        <i className="fa fa-external-link" />
      </a>]}
    stateToggles={stateToggles}>
    <div className="grid">
      <LuaTextArea<Assertion> {...props} stateToggles={stateToggles} />
      <Row className="grid-2-col">
        <TypePart key={JSON.stringify(props.currentSequence)}
          {...props} />
        {props.currentStep.args.assertion_type.includes("recover") &&
          <SequencePart key={JSON.stringify(props.currentSequence)}
            {...props} />}
      </Row>
      <VariablesPart {...props} />
    </div>
  </StepWrapper>;
};
