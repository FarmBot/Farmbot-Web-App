import React from "react";
import { FarmbotColorPicker } from "./farmbot_picker";
import { BlurableInput, Row, Help, ExpandableHeader } from "../../ui";
import { onHslChange as onHslChangeFunc, WeedDetectorSlider } from "./slider";
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
export interface NumericValues {
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

// eslint-disable-next-line complexity
export const ImageWorkspace = (props: ImageWorkspaceProps) => {

  /** Generates a function to handle changes to blur/morph/iteration. */
  const numericChange = (key: NumericKeyName) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      props.onChange(key, parseIntInput(e.currentTarget.value));
    };

  const maybeProcessPhoto = () => {
    const currentImageId = props.currentImage?.body.id;
    if (currentImageId) {
      props.onProcessPhoto(currentImageId);
    }
  };

  const getDefault = (key: NumericKeyName) =>
    WD_KEY_DEFAULTS[props.namespace(key)];

  const getModifiedClass = (key: NumericKeyName) =>
    getModifiedClassNameSpecifyModified(getDefault(key) != props[key]);

  const anyAdvancedModified =
    some(["blur", "morph", "iteration"]
      .map((key: NumericKeyName) => getDefault(key) != props[key]));

  const { H_LO, H_HI, S_LO, S_HI, V_LO, V_HI } = props;
  const onHslChange = onHslChangeFunc(props);
  const cameraCalibrationEnv = props.namespace("H_LO").includes("CAMERA");
  const defaultHLow = getDefault(cameraCalibrationEnv ? "H_HI" : "H_LO");
  const defaultHHigh = getDefault(cameraCalibrationEnv ? "H_LO" : "H_HI");
  return <div className="image-workspace grid">
    <Row className="grid-2-col weed-detection-grid double-gap">
      <div className="grid">
        <Highlight settingName={props.sectionKey == "calibration"
          ? DeviceSetting.calibrationHue
          : DeviceSetting.detectionHue} pathPrefix={Path.photos}>
          <div className="row grid-exp-2 half-gap align-baseline">
            <label htmlFor="hue">{t("HUE")}</label>
            <Help text={t(ToolTips.COLOR_HUE_RANGE, {
              defaultLow: defaultHLow,
              defaultHigh: defaultHHigh,
              defaultColor: cameraCalibrationEnv ? t("red") : t("green"),
            })} />
          </div>
          <WeedDetectorSlider
            className={[
              getModifiedClassNameDefaultFalse(
                Math.min(H_LO, H_HI) != defaultHLow) + "-start",
              getModifiedClassNameDefaultFalse(
                Math.max(H_LO, H_HI) != defaultHHigh) + "-end",
            ].join(" ")}
            onRelease={onHslChange("H")}
            lowest={RANGES.H.LOWEST}
            highest={RANGES.H.HIGHEST}
            lowValue={Math.min(H_LO, H_HI)}
            highValue={Math.max(H_LO, H_HI)} />
        </Highlight>
        <Highlight settingName={props.sectionKey == "calibration"
          ? DeviceSetting.calibrationSaturation
          : DeviceSetting.detectionSaturation} pathPrefix={Path.photos}>
          <div className="row grid-exp-2 half-gap align-baseline">
            <label htmlFor="saturation">{t("SATURATION")}</label>
            <Help text={t(ToolTips.COLOR_SATURATION_RANGE, {
              defaultLow: getDefault("S_LO"),
              defaultHigh: getDefault("S_HI"),
            })} />
          </div>
          <WeedDetectorSlider
            className={[
              getModifiedClassNameDefaultFalse(
                S_LO != getDefault("S_LO")) + "-start",
              getModifiedClassNameDefaultFalse(
                S_HI != getDefault("S_HI")) + "-end",
            ].join(" ")}
            onRelease={onHslChange("S")}
            lowest={RANGES.S.LOWEST}
            highest={RANGES.S.HIGHEST}
            lowValue={S_LO}
            highValue={S_HI} />
        </Highlight>
        <Highlight settingName={props.sectionKey == "calibration"
          ? DeviceSetting.calibrationValue
          : DeviceSetting.detectionValue} pathPrefix={Path.photos}>
          <div className="row grid-exp-2 half-gap align-baseline">
            <label htmlFor="value">{t("VALUE")}</label>
            <Help text={t(ToolTips.COLOR_VALUE_RANGE, {
              defaultLow: getDefault("V_LO"),
              defaultHigh: getDefault("V_HI"),
            })} />
          </div>
          <WeedDetectorSlider
            className={[
              getModifiedClassNameDefaultFalse(
                V_LO != getDefault("V_LO")) + "-start",
              getModifiedClassNameDefaultFalse(
                V_HI != getDefault("V_HI")) + "-end",
            ].join(" ")}
            onRelease={onHslChange("V")}
            lowest={RANGES.V.LOWEST}
            highest={RANGES.V.HIGHEST}
            lowValue={V_LO}
            highValue={V_HI} />
        </Highlight>
      </div>
      <FarmbotColorPicker
        h={[H_LO, H_HI]}
        s={[S_LO, S_HI]}
        v={[V_LO, V_HI]}
        invertHue={props.invertHue} />
    </Row>
    {(props.showAdvanced || anyAdvancedModified) &&
      <Row>
        <ExpandableHeader
          expanded={!!props.advancedSectionOpen}
          title={t("Processing Parameters")}
          onClick={() => props.dispatch({
            type: Actions.TOGGLE_PHOTOS_PANEL_OPTION,
            payload: props.sectionKey == "calibration"
              ? "calibrationPP"
              : "detectionPP",
          })} />
      </Row>}
    {(props.showAdvanced || anyAdvancedModified) &&
      <Collapse isOpen={props.advancedSectionOpen}>
        <Row className="grid-3-col">
          <Highlight
            settingName={props.sectionKey == "calibration"
              ? DeviceSetting.calibrationBlur
              : DeviceSetting.detectionBlur}
            className={"advanced"}
            pathPrefix={Path.photos}>
            <div className="grid no-gap">
              <div className="row grid-exp-2 half-gap align-baseline">
                <label>{t("BLUR")}</label>
                <Help text={t(ToolTips.BLUR, {
                  defaultBlur: getDefault("blur")
                })} />
              </div>
              <BlurableInput type="number"
                wrapperClassName={getModifiedClass("blur")}
                min={RANGES.BLUR.LOWEST}
                max={RANGES.BLUR.HIGHEST}
                onCommit={numericChange("blur")}
                value={"" + props.blur} />
            </div>
          </Highlight>
          <Highlight
            settingName={props.sectionKey == "calibration"
              ? DeviceSetting.calibrationMorph
              : DeviceSetting.detectionMorph}
            pathPrefix={Path.photos}>
            <div className="grid no-gap">
              <div className="row grid-exp-2 half-gap align-baseline">
                <label>{t("MORPH")}</label>
                <Help text={t(ToolTips.MORPH, {
                  defaultMorph: getDefault("morph")
                })} />
              </div>
              <BlurableInput type="number"
                wrapperClassName={getModifiedClass("morph")}
                min={RANGES.MORPH.LOWEST}
                max={RANGES.MORPH.HIGHEST}
                onCommit={numericChange("morph")}
                value={"" + props.morph} />
            </div>
          </Highlight>
          <Highlight
            settingName={props.sectionKey == "calibration"
              ? DeviceSetting.calibrationIterations
              : DeviceSetting.detectionIterations}
            pathPrefix={Path.photos}>
            <div className="grid no-gap">
              <div className="row grid-exp-2 half-gap align-baseline">
                <label>{t("ITERATIONS")}</label>
                <Help text={t(ToolTips.ITERATIONS, {
                  defaultIteration: getDefault("iteration")
                })} />
              </div>
              <BlurableInput type="number"
                wrapperClassName={getModifiedClass("iteration")}
                min={RANGES.ITERATION.LOWEST}
                max={RANGES.ITERATION.HIGHEST}
                onCommit={numericChange("iteration")}
                value={"" + props.iteration} />
            </div>
          </Highlight>
        </Row>
      </Collapse>}
    <Row className="grid-exp-1">
      <div />
      <button
        className="green fb-button"
        title={t("Scan this image")}
        onClick={maybeProcessPhoto}
        disabled={!props.botOnline || !props.images.length}>
        {t("Scan current image")}
      </button>
    </Row>
  </div>;
};
