import React from "react";
import { ToolTips } from "../../constants";
import { semverCompare, SemverResult } from "../../util";
import { t } from "../../i18next_wrapper";
import { ToggleButton } from "../../controls/toggle_button";
import { Help } from "../../ui";
import { isUndefined } from "lodash";
import { RotationSettingProps } from "./interfaces";

export const DISABLE_ROTATE_AT_CAPTURE_KEY =
  "take_photo_disable_rotation_adjustment";

export const RotationSetting = (props: RotationSettingProps) => {
  const versionGreaterThan = (version: string) =>
    semverCompare(props.version, version) == SemverResult.LEFT_IS_GREATER;
  const disableRotationEnv = props.env[DISABLE_ROTATE_AT_CAPTURE_KEY];
  const disableRotation = versionGreaterThan("1.0.14")
    ? !disableRotationEnv?.includes("0")
    : disableRotationEnv?.includes("1");
  return (!isUndefined(disableRotationEnv) || versionGreaterThan("1.0.13"))
    ? <div className={"capture-rotate-setting"}>
      <label>{t("Rotate during capture")}</label>
      <Help text={ToolTips.ROTATE_IMAGE_AT_CAPTURE} />
      <ToggleButton toggleValue={!disableRotation}
        toggleAction={() => props.dispatch(props.saveFarmwareEnv(
          DISABLE_ROTATE_AT_CAPTURE_KEY,
          disableRotation ? "0" : "1"))} />
    </div>
    : <div className={"capture-rotate-setting-hidden"} />;
};
