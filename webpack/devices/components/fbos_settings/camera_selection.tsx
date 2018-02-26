import * as React from "react";
import { DropDownItem, Row, Col, FBSelect } from "../../../ui/index";
import { t } from "i18next";
import {
  CameraSelectionProps, CameraSelectionState
} from "../../interfaces";
import { info, success, error } from "farmbot-toastr/dist";
import { getDevice } from "../../../device";
import { ColWidth } from "../farmbot_os_settings";

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
    const message = { "camera": JSON.stringify(selectedCamera.value) };
    info(t("Sending camera configuration..."), t("Sending"));
    getDevice()
      .setUserEnv(message)
      .then(() => {
        success(t("Successfully configured camera!"));
      })
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
            onChange={this.sendOffConfig} />
        </div>
      </Col>
    </Row>;
  }
}
