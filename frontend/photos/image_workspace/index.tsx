import React from "react";
import { FarmbotColorPicker } from "./farmbot_picker";
import { BlurableInput, Row, Col, Help, ExpandableHeader } from "../../ui";
import { HSV } from "./interfaces";
import { WeedDetectorSlider } from "./slider";
import { TaggedImage } from "farmbot";
import { parseIntInput } from "../../util";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { Actions, DeviceSetting, ToolTips } from "../../constants";
import { WDENVKey } from "../remote_env/interfaces";
import { WD_KEY_DEFAULTS } from "../remote_env/constants";
import { Collapse } from "@blueprintjs/core";
import {
  getModifiedClassNameDefaultFalse, getModifiedClassNameSpecifyModified,
} from "../../settings/default_values";
import { Highlight } from "../../settings/maybe_highlight";
import { Path } from "../../internal_urls";
import { some } from "lodash";

const RANGES = {
  H: { LOWEST: 0, HIGHEST: 179 },
  S: { LOWEST: 0, HIGHEST: 255 },
  V: { LOWEST: 0, HIGHEST: 255 },
  BLUR: { LOWEST: 3, HIGHEST: 100 },
  MORPH: { LOWEST: 1, HIGHEST: 100 },
  ITERATION: { LOWEST: 1, HIGHEST: 100 },
};

/** Number values that the <ImageWorkspace/> panel deals with. */
interface NumericValues {
  iteration: number;
  morph: number;
  blur: number;
  H_LO: number;
  H_HI: number;
  S_LO: number;
  S_HI: number;
  V_LO: number;
  V_HI: number;
}

export type NumericKeyName = keyof NumericValues;

export interface ImageWorkspaceProps extends NumericValues {
  onProcessPhoto(image_id: number): void;
  currentImage: TaggedImage | undefined;
  images: TaggedImage[];
  onChange(key: NumericKeyName, value: number): void;
  invertHue?: boolean;
  botOnline: boolean;
  timeSettings: TimeSettings;
  namespace(key: NumericKeyName): WDENVKey;
  showAdvanced: boolean;
  sectionKey: "calibration" | "detection";
  advancedSectionOpen: boolean;
  dispatch: Function;
}

/** Mapping of HSV values to FBOS Env variables. */
const CHANGE_MAP: Record<HSV, [NumericKeyName, NumericKeyName]> = {
  H: ["H_LO", "H_HI"],
  S: ["S_LO", "S_HI"],
  V: ["V_LO", "V_HI"]
};

export class ImageWorkspace
  extends React.Component<ImageWorkspaceProps> {

  /** Generates a function to handle changes to blur/morph/iteration. */
  numericChange = (key: NumericKeyName) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      this.props.onChange(key, parseIntInput(e.currentTarget.value) || 0);
    };

  maybeProcessPhoto = () => {
    const currentImageId = this.props.currentImage?.body.id;
    if (currentImageId) {
      this.props.onProcessPhoto(currentImageId);
    }
  };

  /** This will trigger onChange callback only when necessary, at most twice.
   * (H|S|L)_HI and (H|S|L)_LO */
  onHslChange = (key: keyof typeof CHANGE_MAP) =>
    (values: [number, number]) => {
      const keys = CHANGE_MAP[key];
      [0, 1].map(i => {
        if (values[i] !== this.props[keys[i]]) {
          this.props.onChange(keys[i], values[i]);
        }
      });
    };

  getDefault = (key: NumericKeyName) =>
    WD_KEY_DEFAULTS[this.props.namespace(key)];

  getModifiedClass = (key: NumericKeyName) =>
    getModifiedClassNameSpecifyModified(this.getDefault(key) != this.props[key]);

  get anyAdvancedModified() {
    return some(["blur", "morph", "iteration"]
      .map((key: NumericKeyName) => this.getDefault(key) != this.props[key]));
  }

  // eslint-disable-next-line complexity
  render() {
    const { H_LO, H_HI, S_LO, S_HI, V_LO, V_HI } = this.props;
    const cameraCalibrationEnv = this.props.namespace("H_LO").includes("CAMERA");
    const defaultHLow = this.getDefault(cameraCalibrationEnv ? "H_HI" : "H_LO");
    const defaultHHigh = this.getDefault(cameraCalibrationEnv ? "H_LO" : "H_HI");
    return <div className="image-workspace">
      <Row>
        <Col xs={12} md={6}>
          <h4>
            <i>{t("Color Range")}</i>
          </h4>
          <Highlight settingName={this.props.sectionKey == "calibration"
            ? DeviceSetting.calibrationHue
            : DeviceSetting.detectionHue} pathPrefix={Path.photos}>
            <label htmlFor="hue">{t("HUE")}</label>
            <Help text={t(ToolTips.COLOR_HUE_RANGE, {
              defaultLow: defaultHLow,
              defaultHigh: defaultHHigh,
              defaultColor: cameraCalibrationEnv ? t("red") : t("green"),
            })} />
            <WeedDetectorSlider
              className={[
                getModifiedClassNameDefaultFalse(
                  Math.min(H_LO, H_HI) != defaultHLow) + "-start",
                getModifiedClassNameDefaultFalse(
                  Math.max(H_LO, H_HI) != defaultHHigh) + "-end",
              ].join(" ")}
              onRelease={this.onHslChange("H")}
              lowest={RANGES.H.LOWEST}
              highest={RANGES.H.HIGHEST}
              lowValue={Math.min(H_LO, H_HI)}
              highValue={Math.max(H_LO, H_HI)} />
          </Highlight>
          <Highlight settingName={this.props.sectionKey == "calibration"
            ? DeviceSetting.calibrationSaturation
            : DeviceSetting.detectionSaturation} pathPrefix={Path.photos}>
            <label htmlFor="saturation">{t("SATURATION")}</label>
            <Help text={t(ToolTips.COLOR_SATURATION_RANGE, {
              defaultLow: this.getDefault("S_LO"),
              defaultHigh: this.getDefault("S_HI"),
            })} />
            <WeedDetectorSlider
              className={[
                getModifiedClassNameDefaultFalse(
                  S_LO != this.getDefault("S_LO")) + "-start",
                getModifiedClassNameDefaultFalse(
                  S_HI != this.getDefault("S_HI")) + "-end",
              ].join(" ")}
              onRelease={this.onHslChange("S")}
              lowest={RANGES.S.LOWEST}
              highest={RANGES.S.HIGHEST}
              lowValue={S_LO}
              highValue={S_HI} />
          </Highlight>
          <Highlight settingName={this.props.sectionKey == "calibration"
            ? DeviceSetting.calibrationValue
            : DeviceSetting.detectionValue} pathPrefix={Path.photos}>
            <label htmlFor="value">{t("VALUE")}</label>
            <Help text={t(ToolTips.COLOR_VALUE_RANGE, {
              defaultLow: this.getDefault("V_LO"),
              defaultHigh: this.getDefault("V_HI"),
            })} />
            <WeedDetectorSlider
              className={[
                getModifiedClassNameDefaultFalse(
                  V_LO != this.getDefault("V_LO")) + "-start",
                getModifiedClassNameDefaultFalse(
                  V_HI != this.getDefault("V_HI")) + "-end",
              ].join(" ")}
              onRelease={this.onHslChange("V")}
              lowest={RANGES.V.LOWEST}
              highest={RANGES.V.HIGHEST}
              lowValue={V_LO}
              highValue={V_HI} />
          </Highlight>
        </Col>
        <Col xs={12} md={6}>
          <FarmbotColorPicker
            h={[H_LO, H_HI]}
            s={[S_LO, S_HI]}
            v={[V_LO, V_HI]}
            invertHue={this.props.invertHue} />
        </Col>
      </Row>
      {(this.props.showAdvanced || this.anyAdvancedModified) &&
        <Row>
          <Col xs={12}>
            <ExpandableHeader
              expanded={!!this.props.advancedSectionOpen}
              title={t("Processing Parameters")}
              onClick={() => this.props.dispatch({
                type: Actions.TOGGLE_PHOTOS_PANEL_OPTION,
                payload: this.props.sectionKey == "calibration"
                  ? "calibrationPP"
                  : "detectionPP",
              })} />
          </Col>
        </Row>}
      {(this.props.showAdvanced || this.anyAdvancedModified) &&
        <Collapse isOpen={this.props.advancedSectionOpen}>
          <Row>
            <Col xs={4}>
              <Highlight
                settingName={this.props.sectionKey == "calibration"
                  ? DeviceSetting.calibrationBlur
                  : DeviceSetting.detectionBlur}
                className={"advanced"}
                pathPrefix={Path.photos}>
                <label>{t("BLUR")}</label>
                <Help text={t(ToolTips.BLUR, {
                  defaultBlur: this.getDefault("blur")
                })} />
                <BlurableInput type="number"
                  wrapperClassName={this.getModifiedClass("blur")}
                  min={RANGES.BLUR.LOWEST}
                  max={RANGES.BLUR.HIGHEST}
                  onCommit={this.numericChange("blur")}
                  value={"" + this.props.blur} />
              </Highlight>
            </Col>
            <Col xs={4}>
              <Highlight
                settingName={this.props.sectionKey == "calibration"
                  ? DeviceSetting.calibrationMorph
                  : DeviceSetting.detectionMorph}
                pathPrefix={Path.photos}>
                <label>{t("MORPH")}</label>
                <Help text={t(ToolTips.MORPH, {
                  defaultMorph: this.getDefault("morph")
                })} />
                <BlurableInput type="number"
                  wrapperClassName={this.getModifiedClass("morph")}
                  min={RANGES.MORPH.LOWEST}
                  max={RANGES.MORPH.HIGHEST}
                  onCommit={this.numericChange("morph")}
                  value={"" + this.props.morph} />
              </Highlight>
            </Col>
            <Col xs={4}>
              <Highlight
                settingName={this.props.sectionKey == "calibration"
                  ? DeviceSetting.calibrationIterations
                  : DeviceSetting.detectionIterations}
                pathPrefix={Path.photos}>
                <label>{t("ITERATIONS")}</label>
                <Help text={t(ToolTips.ITERATIONS, {
                  defaultIteration: this.getDefault("iteration")
                })} />
                <BlurableInput type="number"
                  wrapperClassName={this.getModifiedClass("iteration")}
                  min={RANGES.ITERATION.LOWEST}
                  max={RANGES.ITERATION.HIGHEST}
                  onCommit={this.numericChange("iteration")}
                  value={"" + this.props.iteration} />
              </Highlight>
            </Col>
          </Row>
        </Collapse>}
      <Row>
        <Col xs={12}>
          <button
            className="green fb-button"
            title={t("Scan this image")}
            onClick={this.maybeProcessPhoto}
            disabled={!this.props.botOnline || !this.props.images.length}>
            {t("Scan current image")}
          </button>
        </Col>
      </Row>
    </div>;
  }
}
