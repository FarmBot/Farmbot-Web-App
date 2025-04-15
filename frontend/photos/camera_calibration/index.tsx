import React from "react";
import { docLinkClick, Color } from "../../ui";
import { CameraCalibrationProps } from "./interfaces";
import { ImageWorkspace, NumericKeyName } from "../image_workspace";
import { WDENVKey } from "../remote_env/interfaces";
import { calibrate, scanImage } from "./actions";
import { envGet } from "../remote_env/selectors";
import { MustBeOnline, isBotOnline } from "../../devices/must_be_online";
import { CameraCalibrationConfig, BoolConfig } from "./config";
import {
  namespace as namespaceFunc, CAMERA_CALIBRATION_KEY_PART,
} from "../remote_env/constants";
import { t } from "../../i18next_wrapper";
import { formatEnvKey } from "../remote_env/translators";
import { cameraBtnProps } from "../capture_settings/camera_selection";
import { Content, DeviceSetting, ToolTips } from "../../constants";
import { getCalibratedImageCenter } from "../photo_filter_settings/util";
import { ExternalUrl } from "../../external_urls";
import { NavigateFunction, useNavigate } from "react-router";

export const CameraCalibration = (props: CameraCalibrationProps) => {
  const navigate = useNavigate();
  const change = (key: NumericKeyName, value: number) => {
    saveEnvVar(namespace(key), value);
  };

  const namespace =
    namespaceFunc<CAMERA_CALIBRATION_KEY_PART>("CAMERA_CALIBRATION_");

  const saveEnvVar = (key: WDENVKey, value: number) =>
    props.dispatch(props.saveFarmwareEnv(
      key, JSON.stringify(formatEnvKey(key, value))));

  const wdEnvGet = (key: WDENVKey) => envGet(key, props.wDEnv);

  const { syncStatus, botToMqttStatus } = props;
  const botOnline = isBotOnline(syncStatus, botToMqttStatus);
  const camDisabled = cameraBtnProps(props.env, botOnline);
  const easyCalibration = !!wdEnvGet(namespace("easy_calibration"));
  return <div className="camera-calibration grid">
    <div className="grid">
      <div className={"row grid-exp-1"}>
        <CalibrationCardSVG grid={easyCalibration} />
        <MustBeOnline
          syncStatus={props.syncStatus}
          networkState={props.botToMqttStatus}
          hideBanner={true}>
          <button
            className={`fb-button green ${camDisabled.class}`}
            title={camDisabled.title}
            onClick={camDisabled.click || calibrate(easyCalibration)}>
            {t("Calibrate")}
          </button>
        </MustBeOnline>
      </div>
      <p>{easyCalibration
        ? t(Content.CAMERA_CALIBRATION_GRID_PATTERN)
        : t(Content.CAMERA_CALIBRATION_RED_OBJECTS)}</p>
      <CameraCalibrationMethodConfig
        navigate={navigate}
        dispatch={props.dispatch}
        wdEnvGet={wdEnvGet}
        saveEnvVar={saveEnvVar} />
    </div>
    {!easyCalibration &&
      <ImageWorkspace
        sectionKey={"calibration"}
        dispatch={props.dispatch}
        advancedSectionOpen={props.photosPanelState.calibrationPP}
        botOnline={isBotOnline(
          props.syncStatus, props.botToMqttStatus)}
        onProcessPhoto={scanImage(easyCalibration)}
        images={props.images}
        currentImage={props.currentImage}
        onChange={change}
        timeSettings={props.timeSettings}
        showAdvanced={props.showAdvanced}
        iteration={props.iteration}
        morph={props.morph}
        blur={props.blur}
        H_LO={props.H_LO}
        S_LO={props.S_LO}
        V_LO={props.V_LO}
        H_HI={props.H_HI}
        S_HI={props.S_HI}
        V_HI={props.V_HI}
        namespace={namespace}
        invertHue={!!wdEnvGet(namespace("invert_hue_selection"))} />}
    <CameraCalibrationConfig
      values={props.wDEnv}
      calibrationZ={props.env["CAMERA_CALIBRATION_camera_z"]}
      calibrationImageCenter={getCalibratedImageCenter(props.env)}
      onChange={saveEnvVar} />
  </div>;
};

interface CameraCalibrationMethodConfigProps {
  wdEnvGet(key: WDENVKey): number;
  saveEnvVar(key: WDENVKey, value: number): void;
  navigate: NavigateFunction;
  dispatch: Function;
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
        <a key={0}
          onClick={docLinkClick({
            slug: "camera-calibration",
            navigate: props.navigate,
            dispatch: props.dispatch,
          })}>
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
