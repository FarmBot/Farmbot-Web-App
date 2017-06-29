import * as React from "react";
import { t } from "i18next";
import { Widget, Row, Col } from "../ui/index";
import { CameraCalibrationState, CameraCalibrationProps } from "./interfaces";
import { TitleBar } from "../images/weed_detector/title";
import { ImageWorkspace } from "../images/weed_detector/image_workspace";
import { ToolTips } from "../constants";
import { envSave } from "../images/weed_detector/remote_env/actions";
import { WDENVKey } from "../images/weed_detector/remote_env/interfaces";

export class CameraCalibration extends
  React.Component<CameraCalibrationProps, CameraCalibrationState> {

  calibrate = () => {
    console.log("TODO: Send RPC / farmware activation message here.");
  }

  render() {
    return <Widget className="weed-detector-widget">
      <Row>
        <Col>
          <TitleBar
            title={"Camera Calibration"}
            help={t(ToolTips.CAMERA_CALIBRATION)}
            onCalibrate={this.calibrate}
            env={this.props.env}
          />
          <Row>
            <Col sm={12}>
              <ImageWorkspace
                onProcessPhoto={this.props.onProcessPhoto}
                onFlip={(u) => { console.log("TODO. Stub.") }}
                images={this.props.images}
                currentImage={this.props.currentImage}
                onChange={(key, value) => {
                  let MAPPING: Record<typeof key, WDENVKey> = {
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
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Widget>
  }
}
