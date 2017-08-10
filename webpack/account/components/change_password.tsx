import * as React from "react";
import { t } from "i18next";
import * as _ from "lodash";
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
    let { set, save, password, new_password, user } = this.props;
    let npc = this.props.new_password_confirmation;
    let npcString = "new_password_confirmation";
    let cleared = _.isEmpty(password) &&
      _.isEmpty(new_password) && _.isEmpty(npc);
    return (
      <Widget>
        <WidgetHeader title="Change Password">
          <SaveBtn
            onClick={save}
            isDirty={user.dirty}
            isSaving={user.saving}
            isSaved={cleared}
          />
        </WidgetHeader>
        <WidgetBody>
          <form>
            <label>
              {t("Old Password")}
            </label>
            <BlurableInput
              allowEmpty={true}
              onCommit={set}
              name="password"
              value={password || ""}
              type="password"
            />
            <label>
              {t("New Password")}
            </label>
            <BlurableInput
              allowEmpty={true}
              onCommit={set}
              name="new_password"
              value={new_password || ""}
              type="password"
            />
            <label>
              {t("New Password")}
            </label>
            <BlurableInput
              allowEmpty={true}
              onCommit={set}
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
