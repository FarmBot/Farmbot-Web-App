import React from "react";
import { WeedDetectorProps } from "./interfaces";
import { scanImage, detectPlants } from "./actions";
import { deletePoints } from "../../api/delete_points";
import { Progress } from "../../util";
import { ImageWorkspace, NumericKeyName } from "../image_workspace";
import { WDENVKey } from "../remote_env/interfaces";
import {
  namespace as namespaceFunc, WD_KEY_DEFAULTS, WEED_DETECTOR_KEY_PART,
} from "../remote_env/constants";
import { envGet } from "../remote_env/selectors";
import { MustBeOnline, isBotOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../capture_settings/camera_selection";
import { BoolConfig, NumberBoxConfig } from "../camera_calibration/config";
import { SPECIAL_VALUE_DDI } from "../camera_calibration/constants";
import { DeviceSetting, ToolTips } from "../../constants";
import { formatEnvKey } from "../remote_env/translators";
import { some } from "lodash";

export const WeedDetector = (props: WeedDetectorProps) => {
  const [deletionProgress, setDeletionProgress] = React.useState("");

  /** Delete all map points created by the Weed Detector. */
  const clearWeeds = () => {
    const progress = (p: Readonly<Progress>) => {
      const percentage = `${Math.round((p.completed / p.total) * 100)} %`;
      setDeletionProgress(p.isDone ? "" : percentage);
    };
    props.dispatch(deletePoints(t("weeds"),
      { meta: { created_by: "plant-detection" } }, progress));
    setDeletionProgress(t("Deleting..."));
  };

  const namespace = namespaceFunc<WEED_DETECTOR_KEY_PART>("WEED_DETECTOR_");

  const change = (key: NumericKeyName, value: number) => {
    saveEnvVar(namespace(key), value);
  };

  const saveEnvVar = (key: WDENVKey, value: number) =>
    props.dispatch(props.saveFarmwareEnv(
      key, JSON.stringify(formatEnvKey(key, value))));

  const wdEnvGet = (key: WDENVKey) => envGet(key, props.wDEnv);

  const getDefault = (key: WEED_DETECTOR_KEY_PART) =>
    WD_KEY_DEFAULTS[namespace(key)];

  const getLabeledDefault = (key: WEED_DETECTOR_KEY_PART) =>
    SPECIAL_VALUE_DDI()[getDefault(key)].label;

  const commonProps = {
    wdEnvGet: wdEnvGet,
    onChange: saveEnvVar,
  };

  const anyAdvancedModified =
    some(["save_detected_plants"].map((key: NumericKeyName) =>
      getDefault(key) != wdEnvGet(namespace(key))));

  const wDEnvGet = (key: WDENVKey) => envGet(key, props.wDEnv);
  const { syncStatus, botToMqttStatus } = props;
  const botOnline = isBotOnline(syncStatus, botToMqttStatus);
  const camDisabled = cameraBtnProps(props.env, botOnline);
  return <div className="weed-detector">
    <div className="row grid-exp-1">
      <div />
      <button
        title={t("clear weeds")}
        onClick={clearWeeds}
        className="fb-button red">
        {deletionProgress || t("CLEAR WEEDS")}
      </button>
      <MustBeOnline
        syncStatus={props.syncStatus}
        networkState={props.botToMqttStatus}
        hideBanner={true}>
        <button
          className={`fb-button green ${camDisabled.class}`}
          title={camDisabled.title}
          onClick={camDisabled.click ||
            detectPlants(wDEnvGet("CAMERA_CALIBRATION_coord_scale"))}>
          {t("detect weeds")}
        </button>
      </MustBeOnline>
    </div>
    <ImageWorkspace
      sectionKey={"detection"}
      dispatch={props.dispatch}
      advancedSectionOpen={props.photosPanelState.detectionPP}
      botOnline={
        isBotOnline(props.syncStatus, props.botToMqttStatus)}
      onProcessPhoto={scanImage(wDEnvGet("CAMERA_CALIBRATION_coord_scale"))}
      currentImage={props.currentImage}
      images={props.images}
      onChange={change}
      timeSettings={props.timeSettings}
      showAdvanced={props.showAdvanced}
      namespace={namespace}
      iteration={wDEnvGet(namespace("iteration"))}
      morph={wDEnvGet(namespace("morph"))}
      blur={wDEnvGet(namespace("blur"))}
      H_LO={wDEnvGet(namespace("H_LO"))}
      H_HI={wDEnvGet(namespace("H_HI"))}
      S_LO={wDEnvGet(namespace("S_LO"))}
      S_HI={wDEnvGet(namespace("S_HI"))}
      V_LO={wDEnvGet(namespace("V_LO"))}
      V_HI={wDEnvGet(namespace("V_HI"))} />
    <div className={"grid"}>
      <BoolConfig {...commonProps}
        settingName={DeviceSetting.saveDetectedPlants}
        advanced={true}
        showAdvanced={props.showAdvanced}
        modified={anyAdvancedModified}
        helpText={t(ToolTips.SAVE_DETECTED_PLANTS, {
          defaultSavePlants:
            getLabeledDefault("save_detected_plants")
        })}
        configKey={namespace("save_detected_plants")} />
      <BoolConfig {...commonProps}
        settingName={DeviceSetting.ignoreDetectionsOutOfBounds}
        helpText={t(ToolTips.USE_BOUNDS, {
          defaultUseBounds: getLabeledDefault("use_bounds")
        })}
        configKey={namespace("use_bounds")} />
      <NumberBoxConfig {...commonProps}
        settingName={DeviceSetting.minimumWeedSize}
        configKey={namespace("min_radius")}
        scale={2}
        helpText={t(ToolTips.MIN_RADIUS, {
          defaultMinDiameter: getDefault("min_radius") * 2
        })} />
      <NumberBoxConfig {...commonProps}
        settingName={DeviceSetting.maximumWeedSize}
        configKey={namespace("max_radius")}
        scale={2}
        helpText={t(ToolTips.MAX_RADIUS, {
          defaultMaxDiameter: getDefault("max_radius") * 2
        })} />
    </div>
  </div>;
};
