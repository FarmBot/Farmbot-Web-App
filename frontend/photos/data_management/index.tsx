import React from "react";
import { t } from "../../i18next_wrapper";
import { DevSettings } from "../../settings/dev/dev_support";
import { ToggleHighlightModified } from "./toggle_highlight_modified";
import { ImagingDataManagementProps } from "./interfaces";
import { EnvEditor } from "./env_editor";
import { ExpandableHeader } from "../../ui";
import { Collapse } from "@blueprintjs/core";
import { ClearFarmwareData } from "./clear_farmware_data";
import { ShowAdvancedToggle } from "../../settings/hardware_settings";
import { Highlight } from "../../settings/maybe_highlight";
import { DeviceSetting } from "../../constants";
import { Path } from "../../internal_urls";

export const ImagingDataManagement = (props: ImagingDataManagementProps) => {
  const [advanced, setAdvanced] = React.useState(false);
  return <div className={"imaging-data-management"}>
    <Highlight settingName={DeviceSetting.highlightModifiedSettings}
      pathPrefix={Path.photos}>
      <ToggleHighlightModified
        dispatch={props.dispatch}
        getConfigValue={props.getConfigValue} />
    </Highlight>
    <Highlight settingName={DeviceSetting.showAdvancedSettings}
      pathPrefix={Path.photos}>
      <ShowAdvancedToggle
        dispatch={props.dispatch}
        getConfigValue={props.getConfigValue} />
    </Highlight>
    <Highlight settingName={DeviceSetting.showAdvancedSettings}
      pathPrefix={Path.photos}>
      <div className="row grid-exp-1">
        <label>{t("clear all config data")}</label>
        <ClearFarmwareData farmwareEnvs={props.farmwareEnvs} />
      </div>
    </Highlight>
    {DevSettings.showInternalEnvsEnabled() &&
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
