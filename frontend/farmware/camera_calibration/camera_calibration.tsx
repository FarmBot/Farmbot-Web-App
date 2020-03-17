import * as React from "react";
import { Row, Col } from "../../ui/index";
import { CameraCalibrationProps } from "./interfaces";
import { ImageWorkspace } from "../weed_detector/image_workspace";
import { envSave } from "../weed_detector/remote_env/actions";
import { WDENVKey } from "../weed_detector/remote_env/interfaces";
import { selectImage } from "../images/actions";
import { calibrate, scanImage } from "./actions";
import { envGet } from "../weed_detector/remote_env/selectors";
import { MustBeOnline, isBotOnline } from "../../devices/must_be_online";
import { WeedDetectorConfig, BoolConfig } from "../weed_detector/config";
import { Feature } from "../../devices/interfaces";
import { namespace } from "../weed_detector";
import { t } from "../../i18next_wrapper";
import { formatEnvKey } from "../weed_detector/remote_env/translators";
import {
  cameraBtnProps,
} from "../../devices/components/fbos_settings/camera_selection";
import { ImageFlipper } from "../images/image_flipper";
import { PhotoFooter } from "../images/photos";
import { UUID } from "../../resources/interfaces";
import { DevSettings } from "../../account/dev/dev_support";

export class CameraCalibration extends
  React.Component<CameraCalibrationProps, {}> {
  change = (key: string, value: number) => {
    this.saveEnvVar(this.namespace(key), value);
  }

  namespace = namespace("CAMERA_CALIBRATION_");

  saveEnvVar = (key: WDENVKey, value: number) =>
    this.props.shouldDisplay(Feature.api_farmware_env)
      ? this.props.dispatch(this.props.saveFarmwareEnv(
        key, JSON.stringify(formatEnvKey(key, value))))
      : envSave(key, value)

  onFlip = (uuid: UUID) => this.props.dispatch(selectImage(uuid));

  render() {
    const camDisabled = cameraBtnProps(this.props.env);
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
            onClick={camDisabled.click || this.props.dispatch(calibrate)}>
            {t("Calibrate")}
          </button>
        </MustBeOnline>
      </div>
      <Row>
        <Col sm={12}>
          {DevSettings.futureFeaturesEnabled() &&
            <BoolConfig
              wDEnv={this.props.wDEnv}
              configKey={this.namespace("easy_calibration")}
              label={t("Simpler")}
              onChange={this.saveEnvVar} />}
          {!!envGet(this.namespace("easy_calibration"), this.props.wDEnv)
            ? <div className={"flipper-section"}>
              <ImageFlipper
                onFlip={this.onFlip}
                images={this.props.images}
                currentImage={this.props.currentImage} />
              <PhotoFooter
                image={this.props.currentImage}
                timeSettings={this.props.timeSettings} />
            </div>
            : <ImageWorkspace
              botOnline={
                isBotOnline(this.props.syncStatus, this.props.botToMqttStatus)}
              onProcessPhoto={id => this.props.dispatch(scanImage(id))}
              onFlip={this.onFlip}
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
              invertHue={!!envGet(this.namespace("invert_hue_selection"),
                this.props.wDEnv)} />}
          <WeedDetectorConfig
            values={this.props.wDEnv}
            onChange={this.saveEnvVar} />
        </Col>
      </Row>
    </div>;
  }
}
