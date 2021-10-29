import { TaggedUser } from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { SettingsPanelState } from "../../interfaces";
import { Thunk } from "../../redux/interfaces";

export interface AccountSettingsProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  user: TaggedUser;
  getConfigValue: GetWebAppConfigValue;
}

export interface DeletionRequest {
  password: string;
}

export interface DangerousDeleteProps {
  title: string;
  warning: string;
  confirmation: string;
  dispatch: Function;
  onClick(payload: DeletionRequest): Thunk;
}
