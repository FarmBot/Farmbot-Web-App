import * as React from "react";
import { connect } from "react-redux";
import { DesignerPanel, DesignerPanelContent } from "./designer_panel";
import { DesignerNavTabs, Panel } from "./panel_header";
import { UserEnv, ShouldDisplay, SaveFarmwareEnv } from "../devices/interfaces";
import { maybeGetTimeSettings } from "../resources/selectors";
import { Everything, TimeSettings } from "../interfaces";
import {
  getShouldDisplayFn, getEnv, saveOrEditFarmwareEnv, getImageJobs,
  getImages, getCurrentImage,
} from "../farmware/state_to_props";
import { JobProgress, TaggedImage, SyncStatus } from "farmbot";
import { getStatus } from "../connectivity/reducer_support";
import {
  prepopulateEnv, envGet,
} from "../farmware/weed_detector/remote_env/selectors";
import { Photos } from "../farmware/images/photos";
import {
  CameraCalibration,
} from "../farmware/camera_calibration/camera_calibration";
import { WeedDetector } from "../farmware/weed_detector";
import {
  WDENVKey, WD_ENV,
} from "../farmware/weed_detector/remote_env/interfaces";
import { NetworkState } from "../connectivity/interfaces";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { ExpandableHeader } from "../ui";
import { ClearFarmwareData } from "../farmware/farmware_config_menu";

export interface DesignerPhotosProps {
  dispatch: Function;
  wDEnv: Partial<WD_ENV>;
  env: UserEnv;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  botToMqttStatus: NetworkState;
  timeSettings: TimeSettings;
  syncStatus: SyncStatus | undefined;
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  imageJobs: JobProgress[];
}

interface DesignerPhotosState {
  calibration: boolean;
  detection: boolean;
  manage: boolean;
}

export const mapStateToProps = (props: Everything): DesignerPhotosProps => {
  const images = getImages(props.resources.index);
  const currentImageUuid = props.resources.consumers.farmware.currentImage;
  const currentImage = getCurrentImage(images, currentImageUuid);

  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);

  const botToMqttStatus = getStatus(props.bot.connectivity.uptime["bot.mqtt"]);
  const syncStatus = props.bot.hardware.informational_settings.sync_status;

  return {
    timeSettings: maybeGetTimeSettings(props.resources.index),
    botToMqttStatus,
    wDEnv: prepopulateEnv(env),
    env,
    dispatch: props.dispatch,
    currentImage,
    images,
    syncStatus,
    shouldDisplay,
    saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
    imageJobs: getImageJobs(props.bot.hardware.jobs),
  };
};

export class RawDesignerPhotos
  extends React.Component<DesignerPhotosProps, DesignerPhotosState> {
  state: DesignerPhotosState = {
    calibration: false, detection: false, manage: false
  };
  render() {
    const wDEnvGet = (key: WDENVKey) => envGet(key, this.props.wDEnv);
    return <DesignerPanel panelName={"photos"} panel={Panel.Photos}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"photos"}>
        <label>{t("Photos")}</label>
        <Photos
          syncStatus={this.props.syncStatus}
          botToMqttStatus={this.props.botToMqttStatus}
          timeSettings={this.props.timeSettings}
          dispatch={this.props.dispatch}
          images={this.props.images}
          env={this.props.env}
          currentImage={this.props.currentImage}
          imageJobs={this.props.imageJobs} />
        <ExpandableHeader
          expanded={!!this.state.calibration}
          title={t("Camera calibration")}
          onClick={() => this.setState({ calibration: !this.state.calibration })} />
        <Collapse isOpen={!!this.state.calibration}>
          <CameraCalibration
            syncStatus={this.props.syncStatus}
            dispatch={this.props.dispatch}
            currentImage={this.props.currentImage}
            images={this.props.images}
            wDEnv={this.props.wDEnv}
            env={this.props.env}
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
            timeSettings={this.props.timeSettings}
            shouldDisplay={this.props.shouldDisplay}
            botToMqttStatus={this.props.botToMqttStatus} />
        </Collapse>
        <ExpandableHeader
          expanded={!!this.state.detection}
          title={t("Weed detection")}
          onClick={() => this.setState({ detection: !this.state.detection })} />
        <Collapse isOpen={!!this.state.detection}>
          <WeedDetector {...this.props} />
        </Collapse>
        <ExpandableHeader
          expanded={!!this.state.manage}
          title={t("Manage data")}
          onClick={() => this.setState({ manage: !this.state.manage })} />
        <Collapse isOpen={!!this.state.manage}>
          <ClearFarmwareData />
        </Collapse>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerPhotos = connect(mapStateToProps)(RawDesignerPhotos);
