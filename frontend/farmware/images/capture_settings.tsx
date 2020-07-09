import * as React from "react";
import { ToolTips } from "../../constants";
import { semverCompare, SemverResult } from "../../util";
import { t } from "../../i18next_wrapper";
import {
  CameraSelection,
} from "../../devices/components/fbos_settings/camera_selection";
import { UserEnv, ShouldDisplay } from "../../devices/interfaces";
import { ToggleButton } from "../../controls/toggle_button";
import { SaveFarmwareEnv } from "../interfaces";
import { Help } from "../../ui";

export const DISABLE_ROTATE_AT_CAPTURE_KEY =
  "take_photo_disable_rotation_adjustment";

export interface CaptureSettingsProps {
  env: UserEnv;
  saveFarmwareEnv: SaveFarmwareEnv;
  shouldDisplay: ShouldDisplay;
  botOnline: boolean;
  dispatch: Function;
  version: string;
}

export const CaptureSettings = (props: CaptureSettingsProps) => {
  const disableRotation =
    props.env[DISABLE_ROTATE_AT_CAPTURE_KEY]?.includes("1");
  return <div className="photos-settings">
    <CameraSelection
      dispatch={props.dispatch}
      noLabel={true}
      env={props.env}
      botOnline={props.botOnline}
      saveFarmwareEnv={props.saveFarmwareEnv}
      shouldDisplay={props.shouldDisplay} />
    {semverCompare(props.version, "1.0.13") == SemverResult.LEFT_IS_GREATER &&
      <div className={"capture-rotate-setting"}>
        <label>{t("Adjust rotation during capture")}</label>
        <Help text={ToolTips.ROTATE_IMAGE_AT_CAPTURE} />
        <ToggleButton toggleValue={!disableRotation}
          toggleAction={() => props.dispatch(props.saveFarmwareEnv(
            DISABLE_ROTATE_AT_CAPTURE_KEY,
            disableRotation ? "0" : "1"))} />
      </div>}
  </div>;
};
