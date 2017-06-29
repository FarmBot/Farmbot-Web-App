import { AuthState, User } from "../auth/interfaces";
import { TaggedUser } from "../resources/tagged_resources";

export interface Props {
  user: TaggedUser;
  dispatch: Function;
  saveUser(dispatch: Function, update: Partial<User>): void;
  enactDeletion(dispatch: Function, deletion_confirmation: string | undefined): void;
}

/** JSON form that gets POSTed to the API when user updates their info. */
export interface UserInfo {
  name: string;
  email: string;
  password: string;
  new_password: string;
  new_password_confirmation: string;
  /** User must enter password confirmation to delete their account. */
  deletion_confirmation: string;
}

export type State = Partial<UserInfo>;

export interface DeletionRequest {
  password: string;
}

export interface DeleteAccountPropTypes {
  deletion_confirmation: string | undefined;
  set: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  save: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}

export interface ChangePwPropTypes {
  password: string | undefined;
  new_password: string | undefined;
  new_password_confirmation: string | undefined;
  set: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  save: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}

export interface SettingsPropTypes {
  name: string;
  email: string;
  set: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  save: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
}
