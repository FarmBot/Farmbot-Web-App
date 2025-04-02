import React from "react";
import { t } from "../../i18next_wrapper";
import { StepParams } from "../interfaces";
import { Row, devDocLinkClick } from "../../ui";
import { StateToggleKey, StepWrapper } from "../step_ui";
import { Lua } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";
import { LuaTextArea } from "./tile_lua_support";
import { isMobile } from "../../screen_size";
import { useNavigate } from "react-router";

export const TileLua = (props: StepParams<Lua>) => {
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
    className={"lua-step"}
    helpText={ToolTips.LUA}
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
    <Row>
      <LuaTextArea<Lua> {...props} stateToggles={stateToggles} />
    </Row>
  </StepWrapper>;
};
