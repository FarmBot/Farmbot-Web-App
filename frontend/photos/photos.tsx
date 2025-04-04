import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { envGet } from "./remote_env/selectors";
import { Photos } from "./images/photos";
import { CameraCalibration } from "./camera_calibration";
import { WeedDetector } from "./weed_detector";
import { WDENVKey } from "./remote_env/interfaces";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { ExpandableHeader, ToolTip } from "../ui";
import { Actions, ToolTips } from "../constants";
import { requestFarmwareUpdate } from "../farmware/farmware_info";
import { isBotOnline, MustBeOnline } from "../devices/must_be_online";
import { CaptureSettings } from "./capture_settings";
import {
  PhotoFilterSettings, FiltersEnabledWarning,
} from "./photo_filter_settings";
import { ImageShowFlags, NewPhotoButtonsProps } from "./images/interfaces";
import { DesignerPhotosProps, PhotosPanelState } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { ImagingDataManagement } from "./data_management";
import { getImageShownStatusFlags } from "./photo_filter_settings/util";
import { FarmwareName } from "../sequences/step_tiles/tile_execute_script";
import { FarmwareForm } from "../farmware/farmware_forms";
import { BooleanSetting } from "../session_keys";
import { maybeOpenPanel } from "../settings/maybe_highlight";
import { DevSettings } from "../settings/dev/dev_support";
import { takePhoto } from "../devices/actions";
import { cameraBtnProps } from "./capture_settings/camera_selection";
import { downloadProgress } from "../settings/fbos_settings/os_update_button";

const NewPhotoButtons = (props: NewPhotoButtonsProps) => {
  const imageUploadJobProgress = downloadProgress(props.imageJobs[0]);
  const { syncStatus, botToMqttStatus } = props;
  const botOnline = isBotOnline(syncStatus, botToMqttStatus);
  const camDisabled = cameraBtnProps(props.env, botOnline);
  return <div className={"row"}>
    <p>
      {imageUploadJobProgress &&
        `${t("uploading photo")}...${imageUploadJobProgress}`}
    </p>
    <MustBeOnline
      syncStatus={props.syncStatus}
      networkState={props.botToMqttStatus}
      hideBanner={true}>
      <button
        className={`fb-button green ${camDisabled.class}`}
        title={camDisabled.title}
        onClick={camDisabled.click || props.takePhoto}>
        {t("Take Photo")}
      </button>
    </MustBeOnline>
  </div>;
};

export const RawDesignerPhotos = (props: DesignerPhotosProps) => {
  React.useEffect(() => {
    props.dispatch(maybeOpenPanel("photos"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (key: keyof PhotosPanelState) => () =>
    props.dispatch({ type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: key });

  const imageShowFlags: ImageShowFlags =
    getImageShownStatusFlags({
      getConfigValue: props.getConfigValue,
      env: props.env,
      image: props.currentImage,
      designer: props.designer,
      size: props.currentImageSize,
    });

  const wDEnvGet = (key: WDENVKey) => envGet(key, props.wDEnv);
  const { syncStatus, botToMqttStatus, photosPanelState } = props;
  const botOnline = isBotOnline(syncStatus, botToMqttStatus);
  const common = {
    syncStatus,
    botToMqttStatus,
    timeSettings: props.timeSettings,
    dispatch: props.dispatch,
    images: props.images,
    env: props.env,
    currentImage: props.currentImage,
  };
  const imageCommon = {
    flags: imageShowFlags,
    designer: props.designer,
    getConfigValue: props.getConfigValue,
  };
  const farmwareNames = Object.keys(props.farmwares);
  return <DesignerPanel panelName={"photos"} panel={Panel.Photos}>
    <DesignerPanelContent panelName={"photos"}>
      <div className="row grid-exp-1">
        <h2 className="panel-title">{t("Photos")}</h2>
        <NewPhotoButtons
          syncStatus={props.syncStatus}
          botToMqttStatus={props.botToMqttStatus}
          takePhoto={takePhoto}
          env={props.env}
          imageJobs={props.imageJobs} />
      </div>
      <Photos {...common} {...imageCommon}
        currentBotLocation={props.currentBotLocation}
        movementState={props.movementState}
        arduinoBusy={props.arduinoBusy}
        currentImageSize={props.currentImageSize}
        imageJobs={props.imageJobs} />
      <ExpandableHeader
        expanded={photosPanelState.filter}
        title={t("Filter map photos")}
        onClick={toggle("filter")}>
        <FiltersEnabledWarning
          designer={props.designer}
          getConfigValue={props.getConfigValue} />
      </ExpandableHeader>
      <Collapse isOpen={photosPanelState.filter}>
        <PhotoFilterSettings {...common} {...imageCommon} />
      </Collapse>
      <ExpandableHeader
        expanded={photosPanelState.camera}
        title={t("Camera settings")}
        onClick={toggle("camera")} />
      <Collapse isOpen={photosPanelState.camera}>
        <CaptureSettings
          dispatch={props.dispatch}
          env={props.env}
          botOnline={botOnline}
          version={props.versions["take-photo"] || ""}
          saveFarmwareEnv={props.saveFarmwareEnv} />
      </Collapse>
      <ExpandableHeader
        expanded={!!photosPanelState.calibration}
        title={t("Camera calibration")}
        onClick={toggle("calibration")} />
      <Collapse isOpen={!!photosPanelState.calibration}>
        <ToolTip helpText={ToolTips.CAMERA_CALIBRATION}
          dispatch={props.dispatch}
          docPage={"camera-calibration"} />
        <CameraCalibration {...common}
          photosPanelState={props.photosPanelState}
          wDEnv={props.wDEnv}
          showAdvanced={!!props.getConfigValue(
            BooleanSetting.show_advanced_settings)}
          saveFarmwareEnv={props.saveFarmwareEnv}
          iteration={wDEnvGet("CAMERA_CALIBRATION_iteration")}
          morph={wDEnvGet("CAMERA_CALIBRATION_morph")}
          blur={wDEnvGet("CAMERA_CALIBRATION_blur")}
          H_LO={wDEnvGet("CAMERA_CALIBRATION_H_LO")}
          S_LO={wDEnvGet("CAMERA_CALIBRATION_S_LO")}
          V_LO={wDEnvGet("CAMERA_CALIBRATION_V_LO")}
          H_HI={wDEnvGet("CAMERA_CALIBRATION_H_HI")}
          S_HI={wDEnvGet("CAMERA_CALIBRATION_S_HI")}
          V_HI={wDEnvGet("CAMERA_CALIBRATION_V_HI")}
          versions={props.versions} />
      </Collapse>
      <ExpandableHeader
        expanded={!!photosPanelState.detection}
        title={t("Weed detection")}
        onClick={toggle("detection")} />
      <Collapse isOpen={!!photosPanelState.detection}>
        <ToolTip helpText={ToolTips.WEED_DETECTOR}
          dispatch={props.dispatch}
          docPage={"weed-detection"} />
        <WeedDetector {...common}
          photosPanelState={props.photosPanelState}
          wDEnv={props.wDEnv}
          showAdvanced={!!props.getConfigValue(
            BooleanSetting.show_advanced_settings)}
          saveFarmwareEnv={props.saveFarmwareEnv} />
      </Collapse>
      <ExpandableHeader
        expanded={!!photosPanelState.measure}
        title={t("Measure soil height")}
        onClick={toggle("measure")} />
      <Collapse isOpen={!!photosPanelState.measure}>
        <ToolTip helpText={ToolTips.SOIL_HEIGHT_DETECTION}
          dispatch={props.dispatch}
          docPage={"measure-soil-height"} />
        {farmwareNames.includes(FarmwareName.MeasureSoilHeight)
          ? <FarmwareForm
            farmware={props.farmwares[FarmwareName.MeasureSoilHeight]}
            env={props.env}
            userEnv={props.userEnv}
            farmwareEnvs={props.farmwareEnvs}
            saveFarmwareEnv={props.saveFarmwareEnv}
            botOnline={botOnline}
            hideAdvanced={!props.getConfigValue(
              BooleanSetting.show_advanced_settings)}
            dispatch={props.dispatch} />
          : <div className={"farmware-form"}>
            <button className={"fb-button green farmware-button pseudo-disabled"}>
              {t("measure")}
            </button>
          </div>}
      </Collapse>
      {DevSettings.futureFeaturesEnabled() &&
        <ExpandableHeader
          expanded={!!photosPanelState.manage}
          title={t("Manage data")}
          onClick={toggle("manage")} />}
      {DevSettings.futureFeaturesEnabled() &&
        <Collapse isOpen={!!photosPanelState.manage}>
          <ImagingDataManagement
            dispatch={props.dispatch}
            farmwareEnvs={props.farmwareEnvs}
            getConfigValue={props.getConfigValue} />
        </Collapse>}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const DesignerPhotos = connect(mapStateToProps)(RawDesignerPhotos);
// eslint-disable-next-line import/no-default-export
export default DesignerPhotos;

export interface UpdateImagingPackageProps {
  farmwareName: string;
  version: string | undefined;
  botOnline: boolean;
}

export const UpdateImagingPackage = (props: UpdateImagingPackageProps) =>
  props.version
    ? <div className={"update"}>
      <p>v{props.version}</p>
      <i className={"fa fa-refresh"}
        onClick={requestFarmwareUpdate(props.farmwareName, props.botOnline)} />
    </div>
    : <div className={"update"} />;
