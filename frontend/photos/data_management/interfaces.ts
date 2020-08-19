import { GetWebAppConfigValue } from "../../config_storage/actions";

export interface ImagingDataManagementProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export interface ToggleHighlightModifiedProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}
