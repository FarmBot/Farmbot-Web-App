import React from "react";
import { t } from "../i18next_wrapper";
import { Actions } from "../constants";
import { ControlPanelState } from "../devices/interfaces";

interface ToggleSettingsOpenProps {
  dispatch: Function;
  panels: ControlPanelState;
}

export class ToggleSettingsOpen extends React.Component<ToggleSettingsOpenProps> {

  get open() {
    return Object.values(this.props.panels)
      .filter((open: boolean) => open)
      .length > 0;
  }

  render() {
    return <a>
      <button className="fb-button gray"
        title={t("toggle settings open")}
        onClick={() =>
          this.props.dispatch(bulkToggleControlPanel(!this.open))}>
        <i className={`fa fa-chevron-${!this.open ? "right" : "down"}`} />
      </button>
    </a>;
  }
}

/** Toggles visibility of individual settings panel sections. */
export const toggleControlPanel = (payload: keyof ControlPanelState) => ({
  type: Actions.TOGGLE_CONTROL_PANEL_OPTION, payload
});

/** Toggle visibility of all settings panel sections. */
export const bulkToggleControlPanel = (open: boolean) => ({
  type: Actions.BULK_TOGGLE_CONTROL_PANEL, payload: open
});
