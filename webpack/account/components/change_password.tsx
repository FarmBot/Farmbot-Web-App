import * as React from "react";
import { t } from "i18next";
import {
  BlurableInput,
  Widget,
  WidgetHeader,
  WidgetBody,
  SaveBtn
} from "../../ui";
import { ChangePwPropTypes } from "../interfaces";

export class ChangePassword extends React.Component<ChangePwPropTypes, {}> {
  render() {
    let {
      onChange,
      onClick,
      password,
      new_password,
      user
    } = this.props;
    let npc = this.props.new_password_confirmation;
    let npcString = "new_password_confirmation";

    return (
      <Widget>
        <WidgetHeader title="Change Password">
          <SaveBtn onClick={onClick} status={user.specialStatus} />
        </WidgetHeader>
        <WidgetBody>
          <form>
            <label>
              {t("Old Password")}
            </label>
            <BlurableInput
              allowEmpty={true}
              onCommit={onChange}
              name="password"
              value={password || ""}
              type="password"
            />
            <label>
              {t("New Password")}
            </label>
            <BlurableInput
              allowEmpty={true}
              onCommit={onChange}
              name="new_password"
              value={new_password || ""}
              type="password"
            />
            <label>
              {t("New Password")}
            </label>
            <BlurableInput
              allowEmpty={true}
              onCommit={onChange}
              name={npcString}
              value={npc || ""}
              type="password"
            />
          </form>
        </WidgetBody>
      </Widget >
    );
  }
}
