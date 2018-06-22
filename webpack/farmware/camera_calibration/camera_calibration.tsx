import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../../ui/index";
import { CameraCalibrationProps } from "./interfaces";
import { ImageWorkspace } from "../weed_detector/image_workspace";
import { envSave } from "../weed_detector/remote_env/actions";
import { WDENVKey } from "../weed_detector/remote_env/interfaces";
import { selectImage } from "../images/actions";
import { calibrate, scanImage } from "./actions";
import { envGet } from "../weed_detector/remote_env/selectors";
import { MustBeOnline } from "../../devices/must_be_online";
import { WeedDetectorConfig } from "../weed_detector/config";

export class CameraCalibration extends
  React.Component<CameraCalibrationProps, {}> {
  render() {
    return <div className="weed-detector">
      <button
        onClick={this.props.dispatch(calibrate)}
        className="fb-button green farmware-button" >
        {t("Calibrate")}
      </button>
      <Row>
        <Col sm={12}>
          <MustBeOnline
            syncStatus={this.props.syncStatus}
            networkState={this.props.botToMqttStatus}
            lockOpen={process.env.NODE_ENV !== "production"}>
            <ImageWorkspace
              onProcessPhoto={(id) => { this.props.dispatch(scanImage(id)); }}
              onFlip={(uuid) => this.props.dispatch(selectImage(uuid))}
              images={this.props.images}
              currentImage={this.props.currentImage}
              onChange={(key, value) => {
                const MAPPING: Record<typeof key, WDENVKey> = {
                  "iteration": "CAMERA_CALIBRATION_iteration",
                  "morph": "CAMERA_CALIBRATION_morph",
                  "blur": "CAMERA_CALIBRATION_blur",
                  "H_HI": "CAMERA_CALIBRATION_H_HI",
                  "H_LO": "CAMERA_CALIBRATION_H_LO",
                  "S_HI": "CAMERA_CALIBRATION_S_HI",
                  "S_LO": "CAMERA_CALIBRATION_S_LO",
                  "V_HI": "CAMERA_CALIBRATION_V_HI",
                  "V_LO": "CAMERA_CALIBRATION_V_LO"
                };
                envSave(MAPPING[key], value);
              }}
              iteration={this.props.iteration}
              morph={this.props.morph}
              blur={this.props.blur}
              H_LO={this.props.H_LO}
              S_LO={this.props.S_LO}
              V_LO={this.props.V_LO}
              H_HI={this.props.H_HI}
              S_HI={this.props.S_HI}
              V_HI={this.props.V_HI}
              invertHue={!!envGet(
                "CAMERA_CALIBRATION_invert_hue_selection",
                this.props.env)} />
            <WeedDetectorConfig
              values={this.props.env}
              onChange={envSave} />
          </MustBeOnline>
        </Col>
      </Row>
    </div>;
  }
}
