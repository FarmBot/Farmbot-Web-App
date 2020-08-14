import React from "react";
import {
  CameraSelection,
} from "../../settings/fbos_settings/camera_selection";
import { DevSettings } from "../../settings/dev/dev_support";
import { CaptureSizeSelection } from "./capture_size_selection";
import { RotationSetting } from "./rotation_setting";
import { CaptureSettingsProps, CaptureSettingsState } from "./interfaces";
import { UpdateRow } from "./update_row";

export class CaptureSettings
  extends React.Component<CaptureSettingsProps, CaptureSettingsState> {
  state: CaptureSettingsState = { open: false };

  render() {
    const { dispatch, saveFarmwareEnv, env, botOnline } = this.props;
    const common = { dispatch, env, saveFarmwareEnv };
    return <div className="capture-settings">
      <CameraSelection {...common}
        botOnline={botOnline}
        shouldDisplay={this.props.shouldDisplay} />
      {DevSettings.futureFeaturesEnabled() &&
        <CaptureSizeSelection {...common} />}
      <RotationSetting {...common} version={this.props.version} />
      <UpdateRow version={this.props.version} botOnline={botOnline} />
    </div>;
  }
}
