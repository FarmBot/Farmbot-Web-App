import React from "react";
import { WeedDetectorState, WeedDetectorProps } from "./interfaces";
import { Row, Col } from "../../ui";
import { scanImage, detectPlants } from "./actions";
import { deletePoints } from "../../api/delete_points";
import { Progress } from "../../util";
import { ImageWorkspace, NumericKeyName } from "../image_workspace";
import { WDENVKey } from "../remote_env/interfaces";
import {
  namespace, WD_KEY_DEFAULTS, WEED_DETECTOR_KEY_PART,
} from "../remote_env/constants";
import { envGet } from "../remote_env/selectors";
import { MustBeOnline, isBotOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../capture_settings/camera_selection";
import { BoolConfig, NumberBoxConfig } from "../camera_calibration/config";
import { SPECIAL_VALUE_DDI } from "../camera_calibration/constants";
import { ToolTips } from "../../constants";
import { getModifiedClassNameSpecifyModified } from "../../settings/default_values";

export class WeedDetector
  extends React.Component<WeedDetectorProps, Partial<WeedDetectorState>> {

  constructor(props: WeedDetectorProps) {
    super(props);
    this.state = { remoteFarmwareSettings: {} };
  }

  /** Delete all map points created by the Weed Detector. */
  clearWeeds = () => {
    const progress = (p: Readonly<Progress>) => {
      const percentage = `${Math.round((p.completed / p.total) * 100)} %`;
      this.setState({ deletionProgress: p.isDone ? "" : percentage });
    };
    this.props.dispatch(deletePoints(t("weeds"),
      { meta: { created_by: "plant-detection" } }, progress));
    this.setState({ deletionProgress: t("Deleting...") });
  };

  namespace = namespace<WEED_DETECTOR_KEY_PART>("WEED_DETECTOR_");

  change = (key: NumericKeyName, value: number) => {
    this.saveEnvVar(this.namespace(key), value);
  };

  saveEnvVar = (key: WDENVKey, value: number) =>
    this.props.dispatch(this.props.saveFarmwareEnv(key, "" + value));

  wdEnvGet = (key: WDENVKey) => envGet(key, this.props.wDEnv);

  getDefault = (key: WEED_DETECTOR_KEY_PART) =>
    WD_KEY_DEFAULTS[this.namespace(key)];

  getLabeledDefault = (key: WEED_DETECTOR_KEY_PART) =>
    SPECIAL_VALUE_DDI()[this.getDefault(key)].label;

  get commonProps() {
    return {
      wdEnvGet: this.wdEnvGet,
      onChange: this.saveEnvVar,
    };
  }

  getModifiedClass = (key: NumericKeyName) =>
    getModifiedClassNameSpecifyModified(
      this.getDefault(key) != this.wdEnvGet(this.namespace(key)));

  get anyAdvancedModified() {
    return !!["save_detected_plants"]
      .map((key: NumericKeyName) => this.getModifiedClass(key))
      .join("");
  }

  render() {
    const wDEnvGet = (key: WDENVKey) => envGet(key, this.props.wDEnv);
    const camDisabled = cameraBtnProps(this.props.env);
    return <div className="weed-detector">
      <div className="farmware-button">
        <MustBeOnline
          syncStatus={this.props.syncStatus}
          networkState={this.props.botToMqttStatus}
          hideBanner={true}>
          <button
            className={`fb-button green ${camDisabled.class}`}
            title={camDisabled.title}
            onClick={camDisabled.click ||
              detectPlants(wDEnvGet("CAMERA_CALIBRATION_coord_scale"))}>
            {t("detect weeds")}
          </button>
        </MustBeOnline>
        <button
          title={t("clear weeds")}
          onClick={this.clearWeeds}
          className="fb-button red">
          {this.state.deletionProgress || t("CLEAR WEEDS")}
        </button>
      </div>
      <Row>
        <Col sm={12}>
          <ImageWorkspace
            botOnline={
              isBotOnline(this.props.syncStatus, this.props.botToMqttStatus)}
            onProcessPhoto={scanImage(wDEnvGet("CAMERA_CALIBRATION_coord_scale"))}
            currentImage={this.props.currentImage}
            images={this.props.images}
            onChange={this.change}
            timeSettings={this.props.timeSettings}
            showAdvanced={this.props.showAdvanced}
            namespace={this.namespace}
            iteration={wDEnvGet(this.namespace("iteration"))}
            morph={wDEnvGet(this.namespace("morph"))}
            blur={wDEnvGet(this.namespace("blur"))}
            H_LO={wDEnvGet(this.namespace("H_LO"))}
            H_HI={wDEnvGet(this.namespace("H_HI"))}
            S_LO={wDEnvGet(this.namespace("S_LO"))}
            S_HI={wDEnvGet(this.namespace("S_HI"))}
            V_LO={wDEnvGet(this.namespace("V_LO"))}
            V_HI={wDEnvGet(this.namespace("V_HI"))} />
          <div className={"camera-calibration-config"}>
            <div className={"camera-calibration-configs"}>
              {(this.props.showAdvanced || this.anyAdvancedModified) &&
                <BoolConfig {...this.commonProps}
                  helpText={t(ToolTips.SAVE_DETECTED_PLANTS, {
                    defaultSavePlants:
                      this.getLabeledDefault("save_detected_plants")
                  })}
                  configKey={this.namespace("save_detected_plants")}
                  label={t("Save detected plants")} />}
              <BoolConfig {...this.commonProps}
                helpText={t(ToolTips.USE_BOUNDS, {
                  defaultUseBounds: this.getLabeledDefault("use_bounds")
                })}
                configKey={this.namespace("use_bounds")}
                label={t("Ignore detections out of bounds")} />
              <NumberBoxConfig {...this.commonProps}
                configKey={this.namespace("min_radius")}
                label={t("Minimum weed size")}
                scale={2}
                helpText={t(ToolTips.MIN_RADIUS, {
                  defaultMinDiameter: this.getDefault("min_radius") * 2
                })} />
              <NumberBoxConfig {...this.commonProps}
                configKey={this.namespace("max_radius")}
                label={t("Maximum weed size")}
                scale={2}
                helpText={t(ToolTips.MAX_RADIUS, {
                  defaultMaxDiameter: this.getDefault("max_radius") * 2
                })} />
            </div>
          </div>
        </Col>
      </Row>
    </div>;
  }
}
