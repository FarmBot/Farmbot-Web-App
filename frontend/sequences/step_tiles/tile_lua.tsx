import React from "react";
import { t } from "../../i18next_wrapper";
import { StepParams } from "../interfaces";
import { Row, Col, devDocLinkClick } from "../../ui";
import { StateToggleKey, StepWrapper } from "../step_ui";
import { Lua } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";
import { LuaTextArea } from "./tile_lua_support";
import { isMobile } from "../../screen_size";

export const TileLua = (props: StepParams<Lua>) => {
  const [monaco, setMonaco] = React.useState(!isMobile());
  const [expanded, setExpanded] = React.useState(false);
  const stateToggles = {
    [StateToggleKey.monacoEditor]:
      { enabled: monaco, toggle: () => setMonaco(!monaco) },
    [StateToggleKey.luaExpanded]:
      { enabled: expanded, toggle: () => setExpanded(!expanded) },
  };
  return <StepWrapper {...props}
    className={"lua-step"}
    helpText={ToolTips.LUA}
    links={[
      <a key={"lua"} onClick={devDocLinkClick("lua")}>
        {" " + t("Documentation")}
        <i className="fa fa-external-link" />
      </a>]}
    stateToggles={stateToggles}>
    <Row>
      <Col xs={12}>
        <LuaTextArea<Lua> {...props} stateToggles={stateToggles} />
      </Col>
    </Row>
  </StepWrapper>;
};
