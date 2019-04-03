import * as React from "react";
import { DropDownItem, Row, Col, FBSelect } from "../../../ui/index";

import {
  CameraSelectionProps, CameraSelectionState
} from "./interfaces";
import { info, success, error } from "farmbot-toastr";
import { getDevice } from "../../../device";
import { ColWidth } from "../farmbot_os_settings";
import { Feature } from "../../interfaces";
import { t } from "../../../i18next_wrapper";

const CAMERA_CHOICES = [
  { label: t("USB Camera"), value: "USB" },
  { label: t("Raspberry Pi Camera"), value: "RPI" }
];

const CAMERA_CHOICES_DDI = {
  [CAMERA_CHOICES[0].value]: {
    label: CAMERA_CHOICES[0].label,
    value: CAMERA_CHOICES[0].value
  },
  [CAMERA_CHOICES[1].value]: {
    label: CAMERA_CHOICES[1].label,
    value: CAMERA_CHOICES[1].value
  }
};

export class CameraSelection
  extends React.Component<CameraSelectionProps, CameraSelectionState> {

  state: CameraSelectionState = {
    cameraStatus: ""
  };

  selectedCamera(): DropDownItem {
    const camera = this.props.env["camera"];
    return camera
      ? CAMERA_CHOICES_DDI[JSON.parse(camera)]
      : CAMERA_CHOICES_DDI["USB"];
  }

  sendOffConfig = (selectedCamera: DropDownItem) => {
    const { props } = this;
    const configKey = "camera";
    const config = { [configKey]: JSON.stringify(selectedCamera.value) };
    info(t("Sending camera configuration..."), t("Sending"));
    props.shouldDisplay(Feature.api_farmware_env)
      ? props.dispatch(props.saveFarmwareEnv(configKey, config[configKey]))
      : getDevice()
        .setUserEnv(config)
        .then(() => success(t("Successfully configured camera!"), t("Success")))
        .catch(() => error(t("An error occurred during configuration.")));
  }

  render() {
    return <Row>
      <Col xs={ColWidth.label}>
        <label>
          {t("CAMERA")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <div>
          <FBSelect
            allowEmpty={false}
            list={CAMERA_CHOICES}
            selectedItem={this.selectedCamera()}
            placeholder="Select a camera..."
            onChange={this.sendOffConfig}
            extraClass={this.props.botOnline ? "" : "disabled"} />
        </div>
      </Col>
    </Row>;
  }
}
