import * as React from "react";
import { ToolTips } from "../../constants";
import { semverCompare, SemverResult } from "../../util";
import { t } from "../../i18next_wrapper";
import {
  CameraSelection,
} from "../../settings/fbos_settings/camera_selection";
import { UserEnv, ShouldDisplay } from "../../devices/interfaces";
import { ToggleButton } from "../../controls/toggle_button";
import { SaveFarmwareEnv } from "../../farmware/interfaces";
import { Help, BlurableInput, Row, Col } from "../../ui";
import { isUndefined } from "lodash";
import { DevSettings } from "../../settings/dev/dev_support";

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
  const versionGreaterThan = (version: string) =>
    semverCompare(props.version, version) == SemverResult.LEFT_IS_GREATER;
  const disableRotationEnv = props.env[DISABLE_ROTATE_AT_CAPTURE_KEY];
  const disableRotation = versionGreaterThan("1.0.14")
    ? !disableRotationEnv?.includes("0")
    : disableRotationEnv?.includes("1");
  return <div className="photos-settings">
    <CameraSelection
      dispatch={props.dispatch}
      noLabel={true}
      env={props.env}
      botOnline={props.botOnline}
      saveFarmwareEnv={props.saveFarmwareEnv}
      shouldDisplay={props.shouldDisplay} />
    {(!isUndefined(disableRotationEnv) || versionGreaterThan("1.0.13")) &&
      <div className={"capture-rotate-setting"}>
        <label>{t("Adjust rotation during capture")}</label>
        <Help text={ToolTips.ROTATE_IMAGE_AT_CAPTURE} />
        <ToggleButton toggleValue={!disableRotation}
          toggleAction={() => props.dispatch(props.saveFarmwareEnv(
            DISABLE_ROTATE_AT_CAPTURE_KEY,
            disableRotation ? "0" : "1"))} />
      </div>}
    {DevSettings.futureFeaturesEnabled() &&
      <div className={"image-size-inputs"}>
        <Row className={"resolution"}>
          <label>{t("resolution")}</label>
          <Help text={ToolTips.IMAGE_RESOLUTION} />
        </Row>
        <Row className={"size-inputs"}>
          <Col xs={6}>
            <label>{t("width")}</label>
            <BlurableInput type="number"
              value={props.env["take_photo_width"] || 640}
              onCommit={e => props.dispatch(props.saveFarmwareEnv(
                "take_photo_width", e.currentTarget.value))} />
          </Col>
          <Col xs={6}>
            <label>{t("height")}</label>
            <BlurableInput type="number"
              value={props.env["take_photo_height"] || 480}
              onCommit={e => props.dispatch(props.saveFarmwareEnv(
                "take_photo_height", e.currentTarget.value))} />
          </Col>
        </Row>
      </div>}
  </div>;
};
