import React from "react";
import { DevSettings } from "../../settings/dev/dev_support";
import { ToggleHighlightModified } from "./toggle_highlight_modified";
import { ImagingDataManagementProps } from "./interfaces";
import { EnvEditor } from "./env_editor";
import { ExpandableHeader } from "../../ui";
import { Collapse } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";
import { ClearFarmwareData } from "./clear_farmware_data";

export const ImagingDataManagement = (props: ImagingDataManagementProps) => {
  const [advanced, setAdvanced] = React.useState(false);
  return <div className={"imaging-data-management"}>
    {DevSettings.futureFeaturesEnabled() &&
      <ToggleHighlightModified
        dispatch={props.dispatch}
        getConfigValue={props.getConfigValue} />}
    <fieldset>
      <label>{t("clear all config data")}</label>
      <ClearFarmwareData farmwareEnvs={props.farmwareEnvs} />
    </fieldset>
    {DevSettings.futureFeaturesEnabled() &&
      <div className={"advanced"}>
        <ExpandableHeader
          expanded={advanced}
          title={t("Advanced")}
          onClick={() => setAdvanced(!advanced)} />
        <Collapse isOpen={advanced}>
          <EnvEditor
            title={t("Config editor")}
            dispatch={props.dispatch}
            farmwareEnvs={props.farmwareEnvs} />
        </Collapse>
      </div>}
  </div>;
};
