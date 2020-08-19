import React from "react";
import { DevSettings } from "../../settings/dev/dev_support";
import { ClearFarmwareData } from "./clear_farmware_data";
import { ToggleHighlightModified } from "./toggle_highlight_modified";
import { ImagingDataManagementProps } from "./interfaces";

export const ImagingDataManagement = (props: ImagingDataManagementProps) =>
  <div className={"imaging-data-management"}>
    {DevSettings.futureFeaturesEnabled() &&
      <ToggleHighlightModified
        dispatch={props.dispatch}
        getConfigValue={props.getConfigValue} />}
    <ClearFarmwareData />
  </div>;
