import * as React from "react";
import { t } from "i18next";
import { BlurableInput, Widget, WidgetHeader, WidgetBody, SaveBtn } from "../../ui";
import { SettingsPropTypes } from "../interfaces";
import { FbCheckbox } from "./fb_checkbox";

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
          <FbCheckbox
            onChange={onChange}
            name="experimental_features"
            value={user.body.experimental_features}>
            Enable experimental, possibly unstable, beta features.
          </FbCheckbox>
        </form>
      </WidgetBody>
    </Widget>;
  }
}
