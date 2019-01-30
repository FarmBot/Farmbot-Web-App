import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import { getUserAccountSettings } from "../resources/selectors";
import { getWebAppConfigValue } from "../config_storage/actions";

export function mapStateToProps(props: Everything): Props {
  const user = getUserAccountSettings(props.resources.index);

  return {
    user,
    dispatch: () => { throw new Error("NEVER SHOULD HAPPEN"); },
    getConfigValue: getWebAppConfigValue(() => props),
  };
}
