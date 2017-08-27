import * as React from "react";
import { Session } from "../session";
import { BooleanSetting } from "../session_keys";

interface Props {

}

interface State {

}

export class LangToggle extends React.Component<Props, State> {
  state: State = {};

  toggle = () => {
    Session.setBool(BooleanSetting.DISABLE_I18N, !this.disabled());
    this.setState({ clicked: true });
  };

  disabled = () => Session.getBool(BooleanSetting.DISABLE_I18N);

  verbiage() {
    return (this.disabled() ? "Internationalize Page" : "Set Page to English");
  }

  render() {
    return <div>
      <a onClick={this.toggle} href={window.location.href}>
        <i className="fa fa-globe"></i>
        {this.verbiage()}
      </a>
    </div>;
  }
}
