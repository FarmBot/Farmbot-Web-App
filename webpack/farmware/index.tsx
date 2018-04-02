import * as React from "react";
import { connect } from "react-redux";
import { Page, Col, Row } from "../ui/index";
import { FarmwarePanel } from "./farmware_panel";
import { mapStateToProps } from "./state_to_props";
import { Photos } from "./images/photos";
import { CameraCalibration } from "./camera_calibration/camera_calibration";
import { FarmwareProps } from "../devices/interfaces";
import { WeedDetector } from "./weed_detector/index";
import { envGet } from "./weed_detector/remote_env/selectors";
import { FarmwareForms } from "./farmware_forms";
import { toggleWebAppBool } from "../config_storage/actions";
import { BooleanConfigKey } from "../config_storage/web_app_configs";

export const doToggle =
  (dispatch: Function) =>
    (key: BooleanConfigKey) => dispatch(toggleWebAppBool(key));

@connect(mapStateToProps)
export class FarmwarePage extends React.Component<FarmwareProps, {}> {
  render() {
    return <Page className="farmware">
      <Row>
        <Col xs={12} sm={7}>
          <Photos
            timeOffset={this.props.timeOffset}
            dispatch={this.props.dispatch}
            images={this.props.images}
            currentImage={this.props.currentImage} />
        </Col>
        <Col xs={12} sm={5}>
          <FarmwarePanel
            showFirstParty={!!this.props.webAppConfig.show_first_party_farmware}
            onToggle={doToggle(this.props.dispatch)}
            syncStatus={this.props.syncStatus}
            botToMqttStatus={this.props.botToMqttStatus}
            farmwares={this.props.farmwares}
            firstPartyFarmwareNames={this.props.firstPartyFarmwareNames} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={6}>
          <CameraCalibration
            syncStatus={this.props.syncStatus}
            dispatch={this.props.dispatch}
            currentImage={this.props.currentImage}
            images={this.props.images}
            env={this.props.env}
            iteration={envGet("CAMERA_CALIBRATION_iteration", this.props.env)}
            morph={envGet("CAMERA_CALIBRATION_morph", this.props.env)}
            blur={envGet("CAMERA_CALIBRATION_blur", this.props.env)}
            H_LO={envGet("CAMERA_CALIBRATION_H_LO", this.props.env)}
            S_LO={envGet("CAMERA_CALIBRATION_S_LO", this.props.env)}
            V_LO={envGet("CAMERA_CALIBRATION_V_LO", this.props.env)}
            H_HI={envGet("CAMERA_CALIBRATION_H_HI", this.props.env)}
            S_HI={envGet("CAMERA_CALIBRATION_S_HI", this.props.env)}
            V_HI={envGet("CAMERA_CALIBRATION_V_HI", this.props.env)}
            botToMqttStatus={this.props.botToMqttStatus} />
        </Col>
        <Col xs={12} sm={6}>
          <WeedDetector {...this.props} />
        </Col>
      </Row>
      <FarmwareForms farmwares={this.props.farmwares}
        user_env={this.props.user_env} />
    </Page>;
  }
}
