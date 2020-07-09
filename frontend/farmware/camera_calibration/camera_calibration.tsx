import * as React from "react";
import { Row, Col } from "../../ui/index";
import { CameraCalibrationProps } from "./interfaces";
import {
  ImageWorkspace, NumericKeyName,
} from "../weed_detector/image_workspace";
import { envSave } from "../weed_detector/remote_env/actions";
import { WDENVKey } from "../weed_detector/remote_env/interfaces";
import { calibrate, scanImage } from "./actions";
import { envGet } from "../weed_detector/remote_env/selectors";
import { MustBeOnline, isBotOnline } from "../../devices/must_be_online";
import { CameraCalibrationConfig, BoolConfig } from "./config";
import { Feature } from "../../devices/interfaces";
import {
  namespace, CAMERA_CALIBRATION_KEY_PART,
} from "../weed_detector/remote_env/constants";
import { t } from "../../i18next_wrapper";
import { formatEnvKey } from "../weed_detector/remote_env/translators";
import {
  cameraBtnProps,
} from "../../devices/components/fbos_settings/camera_selection";
import { Content } from "../../constants";
import { semverCompare, SemverResult } from "../../util";
import { getCalibratedImageCenter } from "../images/shown_in_map";

export class CameraCalibration extends
  React.Component<CameraCalibrationProps, {}> {

  change = (key: NumericKeyName, value: number) => {
    this.saveEnvVar(this.namespace(key), value);
  }

  namespace = namespace<CAMERA_CALIBRATION_KEY_PART>("CAMERA_CALIBRATION_");

  saveEnvVar = (key: WDENVKey, value: number) =>
    this.props.shouldDisplay(Feature.api_farmware_env)
      ? this.props.dispatch(this.props.saveFarmwareEnv(
        key, JSON.stringify(formatEnvKey(key, value))))
      : envSave(key, value)

  wdEnvGet = (key: WDENVKey) => envGet(key, this.props.wDEnv);

  render() {
    const { wdEnvGet } = this;
    const camDisabled = cameraBtnProps(this.props.env);
    const easyCalibration = !!wdEnvGet(this.namespace("easy_calibration"));
    const version = this.props.versions["plant-detection"] || "";
    return <div className="camera-calibration">
      <div className="farmware-button">
        <MustBeOnline
          syncStatus={this.props.syncStatus}
          networkState={this.props.botToMqttStatus}
          hideBanner={true}
          lockOpen={process.env.NODE_ENV !== "production"}>
          <button
            className={`fb-button green ${camDisabled.class}`}
            title={camDisabled.title}
            onClick={camDisabled.click || calibrate}>
            {t("Calibrate")}
          </button>
        </MustBeOnline>
      </div>
      <Row>
        <Col sm={12}>
          {(semverCompare(version, "0.0.12") == SemverResult.LEFT_IS_GREATER
            || easyCalibration) &&
            <div className={"simple-camera-calibration-checkbox"}>
              <BoolConfig
                wdEnvGet={wdEnvGet}
                configKey={this.namespace("easy_calibration")}
                label={t("Simpler")}
                onChange={this.saveEnvVar} />
              {easyCalibration &&
                <p>{t(Content.CAMERA_CALIBRATION)}</p>}
            </div>}
          {!easyCalibration &&
            <ImageWorkspace
              botOnline={
                isBotOnline(this.props.syncStatus, this.props.botToMqttStatus)}
              onProcessPhoto={scanImage}
              images={this.props.images}
              currentImage={this.props.currentImage}
              onChange={this.change}
              timeSettings={this.props.timeSettings}
              iteration={this.props.iteration}
              morph={this.props.morph}
              blur={this.props.blur}
              H_LO={this.props.H_LO}
              S_LO={this.props.S_LO}
              V_LO={this.props.V_LO}
              H_HI={this.props.H_HI}
              S_HI={this.props.S_HI}
              V_HI={this.props.V_HI}
              namespace={this.namespace}
              invertHue={!!wdEnvGet(this.namespace("invert_hue_selection"))} />}
          <CameraCalibrationConfig
            values={this.props.wDEnv}
            calibrationZ={this.props.env["CAMERA_CALIBRATION_camera_z"]}
            calibrationImageCenter={getCalibratedImageCenter(this.props.env)}
            onChange={this.saveEnvVar} />
        </Col>
      </Row>
    </div>;
  }
}
