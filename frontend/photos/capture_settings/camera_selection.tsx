import React from "react";
import { Row, FBSelect } from "../../ui";
import { CameraSelectionProps } from "./interfaces";
import { error } from "../../toast/toast";
import { UserEnv } from "../../devices/interfaces";
import { t } from "../../i18next_wrapper";
import { Content, DeviceSetting, ToolTips } from "../../constants";
import { Highlight } from "../../settings/maybe_highlight";
import { getModifiedClassNameSpecifyDefault } from "../../settings/default_values";
import { Path } from "../../internal_urls";

/** Check if the camera has been disabled. */
export const cameraDisabled = (env: UserEnv): boolean =>
  parseCameraSelection(env) === Camera.NONE;

/** Check if the camera has been calibrated. */
export const cameraCalibrated = (env: UserEnv): boolean =>
  parseFloat("" + env.CAMERA_CALIBRATION_coord_scale) > 0;

/** `disabled` and `title` props for buttons with actions that use the camera. */
export const cameraBtnProps = (env: UserEnv, botOnline: boolean) => {
  const disabled = cameraDisabled(env) || !botOnline;
  const noCameraTitle = t(Content.NO_CAMERA_SELECTED);
  const offlineTitle = botOnline ? "" : t("FarmBot is offline");
  const title = cameraDisabled(env) ? noCameraTitle : offlineTitle;
  const noCameraMsg = t(ToolTips.SELECT_A_CAMERA);
  return disabled
    ? {
      class: "pseudo-disabled",
      click: () => botOnline ? error(noCameraMsg, { title }) : undefined,
      title,
    }
    : { class: "", click: undefined, title: "" };
};

export enum Camera {
  USB = "USB",
  RPI = "RPI",
  NONE = "NONE",
}

export const parseCameraSelection = (env: UserEnv): Camera => {
  const camera = env["camera"]?.toUpperCase();
  if (camera?.includes(Camera.NONE)) {
    return Camera.NONE;
  } else if (camera?.includes(Camera.RPI)) {
    return Camera.RPI;
  } else {
    return Camera.USB;
  }
};

const CAMERA_CHOICES = () => ([
  { label: t("USB Camera"), value: Camera.USB },
  { label: t("Raspberry Pi Camera"), value: Camera.RPI },
  { label: t("None"), value: Camera.NONE },
]);

const CAMERA_CHOICES_DDI = () => {
  const CHOICES = CAMERA_CHOICES();
  return {
    [CHOICES[0].value]: { label: CHOICES[0].label, value: CHOICES[0].value },
    [CHOICES[1].value]: { label: CHOICES[1].label, value: CHOICES[1].value },
    [CHOICES[2].value]: { label: CHOICES[2].label, value: CHOICES[2].value },
  };
};

export const CameraSelection = (props: CameraSelectionProps) => {

  const selectedCamera =
    CAMERA_CHOICES_DDI()[parseCameraSelection(props.env)];

  return <Highlight settingName={DeviceSetting.camera} pathPrefix={Path.photos}>
    <Row className="row grid-2-col">
      <label>
        {t("CAMERA")}
      </label>
      <FBSelect
        allowEmpty={false}
        list={CAMERA_CHOICES()}
        selectedItem={selectedCamera}
        onChange={ddi =>
          props.dispatch(props.saveFarmwareEnv("camera",
            JSON.stringify(ddi.value)))}
        extraClass={getModifiedClassNameSpecifyDefault(
          selectedCamera.value, Camera.USB)} />
    </Row>
  </Highlight>;
};
