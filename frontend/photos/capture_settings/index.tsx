import React from "react";
import { CameraSelection } from "./camera_selection";
import { CaptureSizeSelection } from "./capture_size_selection";
import { RotationSetting } from "./rotation_setting";
import { CaptureSettingsProps } from "./interfaces";

export const CaptureSettings = (props: CaptureSettingsProps) => {
  const { dispatch, saveFarmwareEnv, env, botOnline } = props;
  const common = { dispatch, env, saveFarmwareEnv };
  return <div className="capture-settings grid">
    <CameraSelection {...common} botOnline={botOnline} />
    <CaptureSizeSelection {...common} />
    <RotationSetting {...common} version={props.version} />
  </div>;
};
