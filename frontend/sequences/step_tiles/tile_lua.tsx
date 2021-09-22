import React from "react";
import { t } from "../../i18next_wrapper";
import { StepParams } from "../interfaces";
import { Row, Col, devDocLinkClick } from "../../ui";
import { StepWrapper } from "../step_ui";
import { Lua } from "farmbot/dist/corpus";
import { ToolTips } from "../../constants";
import { LuaTextArea } from "./tile_lua_support";

export const TileLua = (props: StepParams<Lua>) => {
  const [monaco, setMonaco] = React.useState(window.innerWidth > 450);
  return <StepWrapper {...props}
    className={"lua-step"}
    helpText={ToolTips.LUA}
    links={[
      <a key={"lua"} onClick={devDocLinkClick("lua")}>
        {" " + t("Documentation")}
        <i className="fa fa-external-link" />
      </a>]}
    monacoEditor={monaco}
    toggleMonacoEditor={() => setMonaco(!monaco)}>
    <Row>
      <Col xs={12}>
        <LuaTextArea<Lua> {...props} useMonacoEditor={monaco} />
      </Col>
    </Row>
  </StepWrapper>;
};
