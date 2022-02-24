import React from "react";
import { CustomSettingsProps } from "./interfaces";
import { Highlight } from "./maybe_highlight";
import { DeviceSetting, Content } from "../constants";
import { Header } from "./hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";
import { EnvEditor } from "../photos/data_management/env_editor";
import { devDocLinkClick } from "../ui";

export const CustomSettings = (props: CustomSettingsProps) =>
  <Highlight className={"section"}
    settingName={DeviceSetting.customSettings}>
    <Header
      title={DeviceSetting.customSettings}
      panel={"custom_settings"}
      dispatch={props.dispatch}
      expanded={props.settingsPanelState.custom_settings} />
    <Collapse isOpen={!!props.settingsPanelState.custom_settings}>
      <div className={"env-editor-lua"}>
        <p>
          {t(Content.FARMWARE_ENV_EDITOR_LUA)}
          {" "}
          {t("Refer to the")}
          {" "}
          <a onClick={devDocLinkClick("lua")}>
            {t("developer documentation")}
          </a>
          {" "}
          {t("for more information.")}
        </p>
      </div>
      <EnvEditor
        title={""}
        dispatch={props.dispatch}
        farmwareEnvs={props.farmwareEnvs} />
    </Collapse>
  </Highlight>;
