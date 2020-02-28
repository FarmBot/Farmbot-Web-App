import * as React from "react";
import { DropDownItem, Row, Col, FBSelect } from "../../../ui/index";
import {
  CameraSelectionProps, CameraSelectionState,
} from "./interfaces";
import { info, success, error } from "../../../toast/toast";
import { getDevice } from "../../../device";
import { ColWidth } from "../farmbot_os_settings";
import { Feature, UserEnv } from "../../interfaces";
import { t } from "../../../i18next_wrapper";
import { Content, ToolTips, DeviceSetting } from "../../../constants";
import { Highlight } from "../maybe_highlight";

/** Check if the camera has been disabled. */
export const cameraDisabled = (env: UserEnv): boolean =>
  parseCameraSelection(env) === Camera.NONE;

/** `disabled` and `title` props for buttons with actions that use the camera. */
export const cameraBtnProps = (env: UserEnv) => {
  const disabled = cameraDisabled(env);
  return disabled
    ? {
      class: "pseudo-disabled",
      click: () =>
        error(t(ToolTips.SELECT_A_CAMERA), t(Content.NO_CAMERA_SELECTED)),
      title: t(Content.NO_CAMERA_SELECTED)
    }
    : { class: "", click: undefined, title: "" };
};

enum Camera {
  USB = "USB",
  RPI = "RPI",
  NONE = "NONE",
}

const parseCameraSelection = (env: UserEnv): Camera => {
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

export class CameraSelection
  extends React.Component<CameraSelectionProps, CameraSelectionState> {

  state: CameraSelectionState = {
    cameraStatus: ""
  };

  selectedCamera = (): DropDownItem =>
    CAMERA_CHOICES_DDI()[parseCameraSelection(this.props.env)]

  sendOffConfig = (selectedCamera: DropDownItem) => {
    const { props } = this;
    const configKey = "camera";
    const config = { [configKey]: JSON.stringify(selectedCamera.value) };
    info(t("Sending camera configuration..."), t("Sending"));
    props.shouldDisplay(Feature.api_farmware_env)
      ? props.dispatch(props.saveFarmwareEnv(configKey, config[configKey]))
      : getDevice()
        .setUserEnv(config)
        .then(() => success(t("Successfully configured camera!")))
        .catch(() => error(t("An error occurred during configuration.")));
  }

  render() {
    return <Row>
      <Highlight settingName={DeviceSetting.camera}>
        <Col xs={ColWidth.label}>
          <label>
            {t("CAMERA")}
          </label>
        </Col>
        <Col xs={ColWidth.description}>
          <FBSelect
            allowEmpty={false}
            list={CAMERA_CHOICES()}
            selectedItem={this.selectedCamera()}
            onChange={this.sendOffConfig}
            extraClass={this.props.botOnline ? "" : "disabled"} />
        </Col>
      </Highlight>
    </Row>;
  }
}
