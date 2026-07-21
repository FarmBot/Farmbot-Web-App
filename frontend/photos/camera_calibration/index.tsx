import React from "react";
import { docLinkClick } from "../../ui";
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
import { CalibrationCardSVG } from "./calibration_card";

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

export { CalibrationCardSVG } from "./calibration_card";
