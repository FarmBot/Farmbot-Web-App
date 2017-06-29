import { Everything } from "../interfaces";
import { deleteUser } from "./actions";
import { Props } from "./interfaces";
import { getUserAccountSettings } from "../resources/selectors";
import { User } from "../auth/interfaces";
import { edit, save } from "../api/crud";

export function mapStateToProps(props: Everything): Props {
  let user = getUserAccountSettings(props.resources.index);

  return {
    user,
    saveUser(dispatch: Function, update: Partial<User>) {
      dispatch(edit(user, update));
      dispatch(save(user.uuid))
    },
    enactDeletion(dispatch: Function, password: string | undefined) {
      dispatch(deleteUser({ password: password || "NEVER SET" }));
    },
    dispatch: () => { throw new Error("NEVER SHOULD HAPPEN"); }
  };
}

