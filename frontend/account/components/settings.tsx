import * as React from "react";
import {
  BlurableInput, Widget, WidgetHeader, WidgetBody, SaveBtn
} from "../../ui/index";
import { SettingsPropTypes } from "../interfaces";
import { t } from "../../i18next_wrapper";

export class Settings extends React.Component<SettingsPropTypes, {}> {
  render() {
    const { user, onChange, onSave } = this.props;
    return <Widget>
      <WidgetHeader title="Account Settings">
        <SaveBtn
          onClick={onSave}
          status={this.props.user.specialStatus} />
      </WidgetHeader>
      <WidgetBody>
        <form>
          <label>
            {t("Your Name")}
          </label>
          <BlurableInput
            onCommit={onChange}
            name="name"
            value={user.body.name || ""}
            type="text" />
          <label>
            {t("Email")}
          </label>
          <BlurableInput
            onCommit={onChange}
            name="email"
            value={user.body.email || ""}
            type="email" />
        </form>
      </WidgetBody>
    </Widget>;
  }
}
