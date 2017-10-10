import * as React from "react";
import { Row, Col } from "../../ui/index";
import { t } from "i18next";
import { CameraSelectionProps, CameraSelectionState } from "../interfaces";
import { DropDownItem } from "../../ui/index";
import { info, success, error } from "farmbot-toastr/dist";
import { getDevice } from "../../device";
import { FBSelect } from "../../ui/new_fb_select";

const CAMERA_CHOICES = [
  { label: "USB Camera", value: "USB" },
  { label: "Raspberry Pi Camera", value: "RPI" }
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

  selectedCamera(): DropDownItem | undefined {
    let cameraSelection = undefined;
    const camera = this.props.env["camera"];
    if (camera) {
      cameraSelection = CAMERA_CHOICES_DDI[JSON.parse(camera)];
    }
    return cameraSelection;
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
      <Col xs={2}>
        <label>
          {t("CAMERA")}
        </label>
      </Col>
      <Col xs={7}>
        <div>
          <FBSelect
            allowEmpty={true}
            list={CAMERA_CHOICES}
            selectedItem={this.selectedCamera()}
            placeholder="Select a camera..."
            onChange={this.sendOffConfig} />
        </div>
      </Col>
    </Row>;
  }
}
