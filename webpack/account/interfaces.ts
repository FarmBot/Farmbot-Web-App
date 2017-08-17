import { User } from "../auth/interfaces";
import { TaggedUser } from "../resources/tagged_resources";

export interface Props {
  user: TaggedUser;
  dispatch: Function;
  saveUser(dispatch: Function, update: Partial<User>): void;
  enactDeletion(dispatch: Function, deletion_confirmation: string | undefined): void;
}

/** JSON form that gets POSTed to the API when user updates their info. */
export interface UserInfo extends Record<keyof User, string> {
  password: string;
  new_password: string;
  new_password_confirmation: string;
  deletion_confirmation: string;
}

export type State = Partial<UserInfo>;

export interface DeletionRequest {
  password: string;
}

export interface DeleteAccountPropTypes {
  deletion_confirmation: string | undefined;
  onChange: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  onClick: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}

export interface ChangePWProps {
  user: TaggedUser;
  password: string | undefined;
  new_password: string | undefined;
  new_password_confirmation: string | undefined;
  onChange: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  onClick: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}

export interface SettingsPropTypes {
  user: TaggedUser;
  onChange: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  onSave: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}
