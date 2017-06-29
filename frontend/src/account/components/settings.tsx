import * as React from "react";
import { t } from "i18next";
import { BlurableInput, Widget, WidgetHeader, WidgetBody } from "../../ui";
import { SettingsPropTypes } from "../interfaces";

export class Settings extends React.Component<SettingsPropTypes, {}> {
  render() {
    let { name, email, set, save } = this.props;
    return <Widget>
      <WidgetHeader title="Account Settings">
        <button
          className="green fb-button"
          type="button"
          onClick={save}
        >
          {t("SAVE")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <form>
          <label>
            {t("Your Name")}
          </label>
          <BlurableInput
            onCommit={set}
            name="name"
            value={name || ""}
            type="text"
          />
          <label>
            {t("Email")}
          </label>
          <BlurableInput
            onCommit={set}
            name="email"
            value={email || ""}
            type="email"
          />
        </form>
      </WidgetBody>
    </Widget>;
  }
}
