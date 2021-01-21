import { TaggedUser } from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { ControlPanelState } from "../../devices/interfaces";
import { Thunk } from "../../redux/interfaces";

export interface AccountSettingsProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
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
