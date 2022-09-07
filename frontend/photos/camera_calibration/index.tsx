import React from "react";
import { Row, Col, docLinkClick, Color } from "../../ui";
import { CameraCalibrationProps } from "./interfaces";
import { ImageWorkspace, NumericKeyName } from "../image_workspace";
import { WDENVKey } from "../remote_env/interfaces";
import { calibrate, scanImage } from "./actions";
import { envGet } from "../remote_env/selectors";
import { MustBeOnline, isBotOnline } from "../../devices/must_be_online";
import { CameraCalibrationConfig, BoolConfig } from "./config";
import { namespace, CAMERA_CALIBRATION_KEY_PART } from "../remote_env/constants";
import { t } from "../../i18next_wrapper";
import { formatEnvKey } from "../remote_env/translators";
import { cameraBtnProps } from "../capture_settings/camera_selection";
import { Content, DeviceSetting, ToolTips } from "../../constants";
import { getCalibratedImageCenter } from "../photo_filter_settings/util";
import { ExternalUrl } from "../../external_urls";

export class CameraCalibration extends
  React.Component<CameraCalibrationProps, {}> {

  change = (key: NumericKeyName, value: number) => {
    this.saveEnvVar(this.namespace(key), value);
  };

  namespace = namespace<CAMERA_CALIBRATION_KEY_PART>("CAMERA_CALIBRATION_");

  saveEnvVar = (key: WDENVKey, value: number) =>
    this.props.dispatch(this.props.saveFarmwareEnv(
      key, JSON.stringify(formatEnvKey(key, value))));

  wdEnvGet = (key: WDENVKey) => envGet(key, this.props.wDEnv);

  render() {
    const { wdEnvGet } = this;
    const { syncStatus, botToMqttStatus } = this.props;
    const botOnline = isBotOnline(syncStatus, botToMqttStatus);
    const camDisabled = cameraBtnProps(this.props.env, botOnline);
    const easyCalibration = !!wdEnvGet(this.namespace("easy_calibration"));
    return <div className="camera-calibration">
      <div className="farmware-button">
        <MustBeOnline
          syncStatus={this.props.syncStatus}
          networkState={this.props.botToMqttStatus}
          hideBanner={true}>
          <button
            className={`fb-button green ${camDisabled.class}`}
            title={camDisabled.title}
            onClick={camDisabled.click || calibrate(easyCalibration)}>
            {t("Calibrate")}
          </button>
        </MustBeOnline>
      </div>
      <Row>
        <Col sm={12}>
          <div className={"simple-camera-calibration-checkbox"}>
            <CalibrationCardSVG grid={easyCalibration} />
            <p>{easyCalibration
              ? t(Content.CAMERA_CALIBRATION_GRID_PATTERN)
              : t(Content.CAMERA_CALIBRATION_RED_OBJECTS)}</p>
            <CameraCalibrationMethodConfig
              wdEnvGet={wdEnvGet}
              saveEnvVar={this.saveEnvVar} />
          </div>
          {!easyCalibration &&
            <ImageWorkspace
              sectionKey={"calibration"}
              dispatch={this.props.dispatch}
              advancedSectionOpen={this.props.photosPanelState.calibrationPP}
              botOnline={isBotOnline(
                this.props.syncStatus, this.props.botToMqttStatus)}
              onProcessPhoto={scanImage(easyCalibration)}
              images={this.props.images}
              currentImage={this.props.currentImage}
              onChange={this.change}
              timeSettings={this.props.timeSettings}
              showAdvanced={this.props.showAdvanced}
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

interface CameraCalibrationMethodConfigProps {
  wdEnvGet(key: WDENVKey): number;
  saveEnvVar(key: WDENVKey, value: number): void;
}

export const CameraCalibrationMethodConfig =
  (props: CameraCalibrationMethodConfigProps) =>
    <BoolConfig
      settingName={DeviceSetting.useAlternativeMethod}
      wdEnvGet={props.wdEnvGet}
      configKey={"CAMERA_CALIBRATION_easy_calibration"}
      invert={true}
      helpText={ToolTips.RED_DOT_CAMERA_CALIBRATION}
      links={[
        <a key={0} onClick={docLinkClick("camera-calibration")}>
          {t("as described in the software documentation.")}
          <i className={"fa fa-external-link"} />
        </a>,
        <a key={1} href={ExternalUrl.Store.cameraCalibrationCard}
          target={"_blank"} rel={"noreferrer"}>
          {t(ToolTips.CAMERA_CALIBRATION_CARD_SHOP_LINK)}
          <i className={"fa fa-external-link"} />
        </a>]}
      onChange={props.saveEnvVar} />;

const WIDTH = 177;
const HEIGHT = 127;
const SCALE = 3;

export const CalibrationCardSVG = (props: { grid: boolean }) =>
  <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    width={`${WIDTH / SCALE}px`}
    height={`${HEIGHT / SCALE}px`}>
    {props.grid ? <CardBack /> : <CardFront />}
  </svg>;

const RED_R = 5;
const CX = 66;
const CY = 64;

const CardFront = () =>
  <g id={"front"} fill={Color.red} stroke={Color.white} strokeWidth={1}>
    <circle cx={17} cy={CY} r={RED_R} stroke={"none"} />
    <circle cx={117} cy={CY} r={RED_R} stroke={"none"} />
    <circle cx={CX} cy={CY} r={4} fill={Color.offWhite} stroke={"none"} />
    <circle cx={117} cy={14} r={4} fill={Color.offWhite} stroke={"none"} />
    <circle cx={CX} cy={CY} r={9}
      fill={"none"} stroke={"cyan"} strokeWidth={2} />
    <line x1={CX} y1={23} x2={CX} y2={49} />
    <line x1={CX} y1={79} x2={CX} y2={105} />
    <line x1={26} y1={CY} x2={52} y2={CY} />
    <line x1={81} y1={CY} x2={108} y2={CY} />
    <line x1={163} y1={8} x2={163} y2={118} strokeWidth={6}
      stroke={Color.lightGray} />
    <line x1={136} y1={8} x2={136} y2={118} strokeWidth={3}
      stroke={Color.lightGray} />
    <line x1={146} y1={17} x2={146} y2={111} strokeWidth={3}
      stroke={Color.lightGray} />
  </g>;

const R = 6;
const SPACING = 30;

const CardBack = () =>
  <g id={"back"} fill={Color.white}>
    <pattern id={"5-dot-row"} patternUnits="userSpaceOnUse"
      x={SPACING / 2} y={12} width={SPACING} height={SPACING}>
      <circle cx={R} cy={R} r={R} />
    </pattern>
    <pattern id={"4-dot-row"} patternUnits="userSpaceOnUse"
      x={SPACING} y={27} width={SPACING} height={SPACING}>
      <circle cx={R} cy={R} r={R} />
    </pattern>
    <rect x={SPACING / 2} y={12} width={149} height={105}
      fill={"url(#5-dot-row)"} />
    <rect x={SPACING} y={26} width={135} height={89}
      fill={"url(#4-dot-row)"} />
  </g>;
