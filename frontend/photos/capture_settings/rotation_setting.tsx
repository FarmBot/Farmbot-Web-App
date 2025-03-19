import React from "react";
import { t } from "../../i18next_wrapper";
import { DeviceSetting, ToolTips } from "../../constants";
import { semverCompare, SemverResult } from "../../util";
import { Help, ToggleButton } from "../../ui";
import { RotationSettingProps } from "./interfaces";
import { getModifiedClassNameDefaultFalse } from "../../settings/default_values";
import { Highlight } from "../../settings/maybe_highlight";
import { Path } from "../../internal_urls";

export const DISABLE_ROTATE_AT_CAPTURE_KEY =
  "take_photo_disable_rotation_adjustment";

export const RotationSetting = (props: RotationSettingProps) => {
  const versionGreaterThan = (version: string) =>
    semverCompare(props.version, version) == SemverResult.LEFT_IS_GREATER;
  const disableRotationEnv = props.env[DISABLE_ROTATE_AT_CAPTURE_KEY];
  const disableRotation = (!props.version || versionGreaterThan("1.0.14"))
    ? !disableRotationEnv?.includes("0")
    : disableRotationEnv?.includes("1");
  return <Highlight settingName={DeviceSetting.rotateDuringCapture}
    pathPrefix={Path.photos}>
    <div className={"capture-rotate-setting row grid-exp-1"}>
      <div className="row grid-exp-2 half-gap align-baseline">
        <label>{t("Rotate during capture")}</label>
        <Help text={ToolTips.ROTATE_IMAGE_AT_CAPTURE} />
      </div>
      <ToggleButton toggleValue={!disableRotation}
        className={getModifiedClassNameDefaultFalse(!disableRotation)}
        toggleAction={() => props.dispatch(props.saveFarmwareEnv(
          DISABLE_ROTATE_AT_CAPTURE_KEY,
          disableRotation ? "0" : "1"))} />
    </div>
  </Highlight>;
};
