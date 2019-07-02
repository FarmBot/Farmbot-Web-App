import * as React from "react";
import { warning } from "../../toast/toast";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { DevSettings } from "./dev_support";

interface S { count: number; }
interface P { dispatch: Function; }

const clicksLeft =
  (x: number) => () => warning(`${x} more clicks`);
const key = "show_dev_menu" as BooleanConfigKey;

const activateDevMode = (dispatch: Function) => {
  DevSettings.setMaxFbosVersionOverride();
  dispatch(setWebAppConfigValue(key, true));
};

const triggers: Record<number, Function> = {
  5: clicksLeft(10),
  10: clicksLeft(5),
  15: activateDevMode,
};

export class DevMode extends React.Component<P, S> {
  state: S = { count: 0 };

  bump = () => {
    const { count } = this.state;
    const cb = triggers[count];
    cb && cb(this.props.dispatch);
    this.setState({ count: count + 1 });
    console.log(count);
  };

  render() {
    return <div style={{ height: "100px" }} onClick={this.bump}>
      <hr />
    </div>;
  }
}
