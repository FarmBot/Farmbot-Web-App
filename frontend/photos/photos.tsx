import * as React from "react";
import { connect } from "react-redux";
import { DesignerPanel, DesignerPanelContent } from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { UserEnv, ShouldDisplay, BotState } from "../devices/interfaces";
import { maybeGetTimeSettings, selectAllImages } from "../resources/selectors";
import { Everything, TimeSettings } from "../interfaces";
import {
  getShouldDisplayFn, getEnv, saveOrEditFarmwareEnv, generateFarmwareDictionary,
} from "../farmware/state_to_props";
import { JobProgress, TaggedImage, SyncStatus } from "farmbot";
import { getStatus } from "../connectivity/reducer_support";
import {
  prepopulateEnv, envGet,
} from "./remote_env/selectors";
import { Photos } from "./images/photos";
import { CaptureSettings } from "./images/capture_settings";
import {
  CameraCalibration,
} from "./camera_calibration/camera_calibration";
import { WeedDetector } from "./weed_detector";
import {
  WDENVKey, WD_ENV,
} from "./remote_env/interfaces";
import { NetworkState } from "../connectivity/interfaces";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { ExpandableHeader, ToolTip } from "../ui";
import { ToolTips } from "../constants";
import { updateFarmware } from "../farmware/farmware_info";
import { destroyAll } from "../api/crud";
import { success, error } from "../toast/toast";
import { isBotOnline } from "../devices/must_be_online";
import { SaveFarmwareEnv } from "../farmware/interfaces";
import {
  getWebAppConfigValue, GetWebAppConfigValue, setWebAppConfigValue,
} from "../config_storage/actions";
import { chain } from "lodash";
import { betterCompact } from "../util";
import { ResourceIndex } from "../resources/interfaces";
import { ToggleButton } from "../controls/toggle_button";
import { DevSettings } from "../settings/dev/dev_support";
import { BooleanSetting } from "../session_keys";

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
  versions: Record<string, string>;
  hiddenImages: number[];
  shownImages: number[];
  hideUnShownImages: boolean;
  alwaysHighlightImage: boolean;
  getConfigValue: GetWebAppConfigValue;
}

interface DesignerPhotosState {
  calibration: boolean;
  detection: boolean;
  manage: boolean;
}

export const getImageJobs =
  (allJobs: BotState["hardware"]["jobs"]): JobProgress[] => {
    const jobs = allJobs || {};
    const imageJobNames = Object.keys(jobs).filter(x => x != "FBOS_OTA");
    const imageJobs: JobProgress[] =
      chain(betterCompact(imageJobNames.map(x => jobs[x])))
        .sortBy("time")
        .reverse()
        .value();
    return imageJobs;
  };

const getImages = (ri: ResourceIndex): TaggedImage[] =>
  chain(selectAllImages(ri))
    .sortBy(x => x.body.id)
    .reverse()
    .value();

export const getCurrentImage =
  (images: TaggedImage[], currentImgUuid: string | undefined): TaggedImage => {
    const firstImage = images[0];
    const currentImage =
      images.filter(i => i.uuid === currentImgUuid)[0] || firstImage;
    return currentImage;
  };

export const mapStateToProps = (props: Everything): DesignerPhotosProps => {
  const images = getImages(props.resources.index);
  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);

  const versions: Record<string, string> = {};
  Object.entries(generateFarmwareDictionary(props.bot, props.resources.index))
    .map(([farmwareName, manifest]) =>
      versions[farmwareName] = manifest.meta.version);

  const currentImageUuid = props.resources.consumers.farmware.currentImage;
  const {
    hiddenImages, shownImages, hideUnShownImages, alwaysHighlightImage,
  } = props.resources.consumers.farm_designer;

  return {
    timeSettings: maybeGetTimeSettings(props.resources.index),
    botToMqttStatus: getStatus(props.bot.connectivity.uptime["bot.mqtt"]),
    wDEnv: prepopulateEnv(env),
    env,
    dispatch: props.dispatch,
    currentImage: getCurrentImage(images, currentImageUuid),
    images,
    syncStatus: props.bot.hardware.informational_settings.sync_status,
    shouldDisplay,
    saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
    imageJobs: getImageJobs(props.bot.hardware.jobs),
    versions,
    hiddenImages,
    shownImages,
    hideUnShownImages,
    alwaysHighlightImage,
    getConfigValue: getWebAppConfigValue(() => props),
  };
};

interface UpdateProps {
  farmwareName: string;
  version: string | undefined;
  botOnline: boolean;
}

const Update = (props: UpdateProps) =>
  props.version
    ? <div className={"update"}>
      <p>v{props.version}</p>
      <i className={`fa fa-refresh`}
        onClick={updateFarmware(props.farmwareName, props.botOnline)} />
    </div>
    : <div className={"update"} />;

export const ClearFarmwareData = () =>
  <fieldset>
    <label>
      {t("Clear config data")}
    </label>
    <button
      className={"fb-button red fa fa-trash"}
      title={t("delete all data")}
      onClick={() => destroyAll("FarmwareEnv")
        .then(() => success(t("Config data successfully deleted.")))
        .catch(() => error(t("Error deleting config data")))} />
  </fieldset>;

export class RawDesignerPhotos
  extends React.Component<DesignerPhotosProps, DesignerPhotosState> {
  state: DesignerPhotosState = {
    calibration: false, detection: false, manage: false,
  };

  toggle = (key: keyof DesignerPhotosState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

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
      highlightModified: !!this.props.getConfigValue(
        BooleanSetting.highlight_modified_settings),
    };
    return <DesignerPanel panelName={"photos"} panel={Panel.Photos}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"photos"}>
        <label>{t("Photos")}</label>
        <ToolTip helpText={ToolTips.PHOTOS} className={"photos-tooltip"}>
          <Update version={this.props.versions["take-photo"]}
            farmwareName={"take-photo"} botOnline={botOnline} />
          <CaptureSettings
            dispatch={this.props.dispatch}
            env={this.props.env}
            botOnline={botOnline}
            version={this.props.versions["take-photo"] || ""}
            saveFarmwareEnv={this.props.saveFarmwareEnv}
            shouldDisplay={this.props.shouldDisplay} />
        </ToolTip>
        <Photos {...common}
          hiddenImages={this.props.hiddenImages}
          shownImages={this.props.shownImages}
          hideUnShownImages={this.props.hideUnShownImages}
          alwaysHighlightImage={this.props.alwaysHighlightImage}
          getConfigValue={this.props.getConfigValue}
          imageJobs={this.props.imageJobs} />
        <ExpandableHeader
          expanded={!!this.state.calibration}
          title={t("Camera calibration")}
          onClick={this.toggle("calibration")} />
        <Collapse isOpen={!!this.state.calibration}>
          <ToolTip helpText={ToolTips.CAMERA_CALIBRATION}
            docPage={"camera-calibration"}>
            <Update version={this.props.versions["plant-detection"]}
              farmwareName={"plant-detection"} botOnline={botOnline} />
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
            versions={this.props.versions}
            shouldDisplay={this.props.shouldDisplay} />
        </Collapse>
        <ExpandableHeader
          expanded={!!this.state.detection}
          title={t("Weed detection")}
          onClick={this.toggle("detection")} />
        <Collapse isOpen={!!this.state.detection}>
          <ToolTip helpText={ToolTips.WEED_DETECTOR} docPage={"weed-detection"}>
            <Update version={this.props.versions["plant-detection"]}
              farmwareName={"plant-detection"} botOnline={botOnline} />
          </ToolTip>
          <WeedDetector  {...common}
            wDEnv={this.props.wDEnv}
            saveFarmwareEnv={this.props.saveFarmwareEnv}
            shouldDisplay={this.props.shouldDisplay} />
        </Collapse>
        <ExpandableHeader
          expanded={!!this.state.manage}
          title={t("Manage data")}
          onClick={this.toggle("manage")} />
        <Collapse isOpen={!!this.state.manage}>
          {DevSettings.futureFeaturesEnabled() &&
            <div className={"highlight-modified-toggle"}>
              <label>{t("Highlight settings modified from default")}</label>
              <ToggleButton
                toggleValue={!!this.props.getConfigValue(
                  BooleanSetting.highlight_modified_settings)}
                toggleAction={() => this.props.dispatch(setWebAppConfigValue(
                  BooleanSetting.highlight_modified_settings,
                  !this.props.getConfigValue(
                    BooleanSetting.highlight_modified_settings)))} />
            </div>}
          <ClearFarmwareData />
        </Collapse>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerPhotos = connect(mapStateToProps)(RawDesignerPhotos);
