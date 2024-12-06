import React from "react";
import { t } from "../i18next_wrapper";
import { Actions } from "../constants";
import { SettingsPanelState } from "../interfaces";

interface ToggleSettingsOpenProps {
  dispatch: Function;
  panels: SettingsPanelState;
}

export class ToggleSettingsOpen extends React.Component<ToggleSettingsOpenProps> {

  get open() {
    return Object.values(this.props.panels)
      .filter((open: boolean) => open)
      .length > 0;
  }

  render() {
    return <a>
      <button className="fb-icon-button invert"
        title={t("toggle settings open")}
        onClick={() =>
          this.props.dispatch(bulkToggleControlPanel(!this.open))}>
        <i className={`fa fa-${!this.open ? "expand" : "compress"}`} />
      </button>
    </a>;
  }
}

/** Toggles visibility of individual settings panel sections. */
export const toggleControlPanel = (payload: keyof SettingsPanelState) => ({
  type: Actions.TOGGLE_SETTINGS_PANEL_OPTION, payload
});

/** Toggle visibility of all settings panel sections. */
export const bulkToggleControlPanel = (open: boolean) => ({
  type: Actions.BULK_TOGGLE_SETTINGS_PANEL, payload: open
});
