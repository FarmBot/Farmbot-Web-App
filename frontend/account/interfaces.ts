import { User } from "../auth/interfaces";
import { TaggedUser } from "farmbot";
import { GetWebAppConfigValue } from "../config_storage/actions";

export interface Props {
  user: TaggedUser;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

/** JSON form that gets POSTed to the API when user updates their info. */
export interface UserInfo extends Record<keyof User, string> {
  password: string;
  new_password: string;
  new_password_confirmation: string;
  password_deletion_confirmation: string;
}

export interface DeletionRequest {
  password: string;
}

export interface DeleteAccountProps {
  onClick(pw: string): void;
}

export interface DeleteAccountState {
  password: string;
}

export interface SettingsPropTypes {
  user: TaggedUser;
  onChange: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  onSave: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}
