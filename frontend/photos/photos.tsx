import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { envGet } from "./remote_env/selectors";
import { Photos } from "./images/photos";
import { CameraCalibration } from "./camera_calibration";
import { WeedDetector } from "./weed_detector";
import { WDENVKey } from "./remote_env/interfaces";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { ExpandableHeader, ToolTip } from "../ui";
import { ToolTips } from "../constants";
import { requestFarmwareUpdate } from "../farmware/farmware_info";
import { isBotOnline } from "../devices/must_be_online";
import { CaptureSettings } from "./capture_settings";
import {
  PhotoFilterSettings, FiltersEnabledWarning,
} from "./photo_filter_settings";
import { ImageShowFlags } from "./images/interfaces";
import { DesignerPhotosProps, DesignerPhotosState } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { ImagingDataManagement } from "./data_management";
import { getImageShownStatusFlags } from "./photo_filter_settings/util";
import { FarmwareName } from "../sequences/step_tiles/tile_execute_script";
import { FarmwareForm } from "../farmware/farmware_forms";

export class RawDesignerPhotos
  extends React.Component<DesignerPhotosProps, DesignerPhotosState> {
  state: DesignerPhotosState = {
    filter: false, camera: false, calibration: false, detection: false,
    measure: false, manage: false,
  };

  toggle = (key: keyof DesignerPhotosState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  get imageShowFlags(): ImageShowFlags {
    return getImageShownStatusFlags({
      getConfigValue: this.props.getConfigValue,
      env: this.props.env,
      image: this.props.currentImage,
      hiddenImages: this.props.hiddenImages,
      size: this.props.currentImageSize,
    });
  }

  render() {
    const wDEnvGet = (key: WDENVKey) => envGet(key, this.props.wDEnv);
    const { syncStatus, botToMqttStatus } = this.props;
    const botOnline = isBotOnline(syncStatus, botToMqttStatus);
    const common = {
      syncStatus,
      botToMqttStatus,
      timeSettings: this.props.timeSettings,
      dispatch: this.props.dispatch,
      images: this.props.images,
      env: this.props.env,
      currentImage: this.props.currentImage,
    };
    const imageCommon = {
      flags: this.imageShowFlags,
      hideUnShownImages: this.props.hideUnShownImages,
      alwaysHighlightImage: this.props.alwaysHighlightImage,
      getConfigValue: this.props.getConfigValue,
    };
    const farmwareNames = Object.keys(this.props.farmwares);
    return <DesignerPanel panelName={"photos"} panel={Panel.Photos}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"photos"}>
        <label>{t("Photos")}</label>
        <Photos {...common} {...imageCommon}
          hiddenImages={this.props.hiddenImages}
          shownImages={this.props.shownImages}
          currentImageSize={this.props.currentImageSize}
          imageJobs={this.props.imageJobs} />
        <ExpandableHeader
          expanded={this.state.filter}
          title={t("Filter map photos")}
          onClick={this.toggle("filter")}>
          <FiltersEnabledWarning
            hideUnShownImages={this.props.hideUnShownImages}
            getConfigValue={this.props.getConfigValue} />
        </ExpandableHeader>
        <Collapse isOpen={this.state.filter}>
          <PhotoFilterSettings {...common} {...imageCommon} />
        </Collapse>
        <ExpandableHeader
          expanded={this.state.camera}
          title={t("Camera settings")}
          onClick={this.toggle("camera")} />
        <Collapse isOpen={this.state.camera}>
          <CaptureSettings
            dispatch={this.props.dispatch}
            env={this.props.env}
            botOnline={botOnline}
            version={this.props.versions["take-photo"] || ""}
            saveFarmwareEnv={this.props.saveFarmwareEnv} />
        </Collapse>
        <ExpandableHeader
          expanded={!!this.state.calibration}
          title={t("Camera calibration")}
          onClick={this.toggle("calibration")} />
        <Collapse isOpen={!!this.state.calibration}>
          <ToolTip helpText={ToolTips.CAMERA_CALIBRATION}
            docPage={"camera-calibration"}>
            <UpdateImagingPackage
              version={this.props.versions[FarmwareName.PlantDetection]}
              farmwareName={FarmwareName.PlantDetection} botOnline={botOnline} />
          </ToolTip>
          <CameraCalibration {...common}
            wDEnv={this.props.wDEnv}
            saveFarmwareEnv={this.props.saveFarmwareEnv}
            iteration={wDEnvGet("CAMERA_CALIBRATION_iteration")}
            morph={wDEnvGet("CAMERA_CALIBRATION_morph")}
            blur={wDEnvGet("CAMERA_CALIBRATION_blur")}
            H_LO={wDEnvGet("CAMERA_CALIBRATION_H_LO")}
            S_LO={wDEnvGet("CAMERA_CALIBRATION_S_LO")}
            V_LO={wDEnvGet("CAMERA_CALIBRATION_V_LO")}
            H_HI={wDEnvGet("CAMERA_CALIBRATION_H_HI")}
            S_HI={wDEnvGet("CAMERA_CALIBRATION_S_HI")}
            V_HI={wDEnvGet("CAMERA_CALIBRATION_V_HI")}
            versions={this.props.versions} />
        </Collapse>
        <ExpandableHeader
          expanded={!!this.state.detection}
          title={t("Weed detection")}
          onClick={this.toggle("detection")} />
        <Collapse isOpen={!!this.state.detection}>
          <ToolTip helpText={ToolTips.WEED_DETECTOR} docPage={"weed-detection"}>
            <UpdateImagingPackage
              version={this.props.versions[FarmwareName.PlantDetection]}
              farmwareName={FarmwareName.PlantDetection} botOnline={botOnline} />
          </ToolTip>
          <WeedDetector {...common}
            wDEnv={this.props.wDEnv}
            saveFarmwareEnv={this.props.saveFarmwareEnv} />
        </Collapse>
        {farmwareNames.includes(FarmwareName.MeasureSoilHeight) &&
          <ExpandableHeader
            expanded={!!this.state.measure}
            title={t("Measure soil height")}
            onClick={this.toggle("measure")} />}
        {farmwareNames.includes(FarmwareName.MeasureSoilHeight) &&
          <Collapse isOpen={!!this.state.measure}>
            <ToolTip helpText={ToolTips.SOIL_HEIGHT_DETECTION}
              docPage={"measure-soil-height"}>
              <UpdateImagingPackage
                version={this.props.versions[FarmwareName.MeasureSoilHeight]}
                farmwareName={FarmwareName.MeasureSoilHeight}
                botOnline={botOnline} />
            </ToolTip>
            <FarmwareForm
              farmware={this.props.farmwares[FarmwareName.MeasureSoilHeight]}
              env={this.props.env}
              userEnv={this.props.userEnv}
              farmwareEnvs={this.props.farmwareEnvs}
              saveFarmwareEnv={this.props.saveFarmwareEnv}
              botOnline={botOnline}
              dispatch={this.props.dispatch} />
          </Collapse>}
        <ExpandableHeader
          expanded={!!this.state.manage}
          title={t("Manage data")}
          onClick={this.toggle("manage")} />
        <Collapse isOpen={!!this.state.manage}>
          <ImagingDataManagement
            dispatch={this.props.dispatch}
            farmwareEnvs={this.props.farmwareEnvs}
            getConfigValue={this.props.getConfigValue} />
        </Collapse>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerPhotos = connect(mapStateToProps)(RawDesignerPhotos);

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
