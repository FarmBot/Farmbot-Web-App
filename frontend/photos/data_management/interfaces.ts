import { TaggedFarmwareEnv } from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";

export interface ImagingDataManagementProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  farmwareEnvs: TaggedFarmwareEnv[];
}

export interface ToggleHighlightModifiedProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export interface EnvEditorProps {
  dispatch: Function;
  farmwareEnvs: TaggedFarmwareEnv[];
  title?: string;
}

export interface ClearFarmwareDataProps {
  farmwareEnvs: TaggedFarmwareEnv[];
  children?: React.ReactNode;
}
