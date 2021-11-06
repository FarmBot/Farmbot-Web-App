import React from "react";
import { CameraSelection } from "./camera_selection";
import { CaptureSizeSelection } from "./capture_size_selection";
import { RotationSetting } from "./rotation_setting";
import { CaptureSettingsProps, CaptureSettingsState } from "./interfaces";

export class CaptureSettings
  extends React.Component<CaptureSettingsProps, CaptureSettingsState> {
  state: CaptureSettingsState = { open: false };

  render() {
    const { dispatch, saveFarmwareEnv, env, botOnline } = this.props;
    const common = { dispatch, env, saveFarmwareEnv };
    return <div className="capture-settings">
      <CameraSelection {...common} botOnline={botOnline} />
      <CaptureSizeSelection {...common} />
      <RotationSetting {...common} version={this.props.version} />
    </div>;
  }
}
