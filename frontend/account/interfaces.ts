import { TaggedUser } from "farmbot";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { Thunk } from "../redux/interfaces";

export interface Props {
  user: TaggedUser;
  dispatch: Function;
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

export interface DangerousDeleteState extends DeletionRequest { }

export interface SettingsPropTypes {
  user: TaggedUser;
  onChange: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  onSave: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}
