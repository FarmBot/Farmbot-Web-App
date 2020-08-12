import * as React from "react";
import { FarmbotColorPicker } from "./farmbot_picker";
import { BlurableInput, Row, Col, Help, ExpandableHeader } from "../../ui";
import { HSV } from "./interfaces";
import { WeedDetectorSlider } from "./slider";
import { TaggedImage } from "farmbot";
import { parseIntInput } from "../../util";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { ToolTips } from "../../constants";
import { WDENVKey } from "../remote_env/interfaces";
import {
  CAMERA_CALIBRATION_KEY_PART, WD_KEY_DEFAULTS,
} from "../remote_env/constants";
import { Collapse } from "@blueprintjs/core";

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
  namespace(key: CAMERA_CALIBRATION_KEY_PART): WDENVKey;
  highlightModified: boolean;
}

/** Mapping of HSV values to FBOS Env variables. */
const CHANGE_MAP: Record<HSV, [NumericKeyName, NumericKeyName]> = {
  H: ["H_LO", "H_HI"],
  S: ["S_LO", "S_HI"],
  V: ["V_LO", "V_HI"]
};

interface ImageWorkspaceState {
  open: boolean;
}

export class ImageWorkspace
  extends React.Component<ImageWorkspaceProps, ImageWorkspaceState> {
  state: ImageWorkspaceState = { open: false };

  /** Generates a function to handle changes to blur/morph/iteration. */
  numericChange = (key: NumericKeyName) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      this.props.onChange(key, parseIntInput(e.currentTarget.value) || 0);
    };

  maybeProcessPhoto = () => {
    const img = this.props.currentImage || this.props.images[0];
    if (img?.body.id) {
      this.props.onProcessPhoto(img.body.id);
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

  getDefault = (key: CAMERA_CALIBRATION_KEY_PART) =>
    WD_KEY_DEFAULTS[this.props.namespace(key)];

  getModifiedClass =
    (key: CAMERA_CALIBRATION_KEY_PART & keyof ImageWorkspaceProps) =>
      (this.props.highlightModified && (this.getDefault(key) != this.props[key]))
        ? "modified"
        : "";

  render() {
    const { H_LO, H_HI, S_LO, S_HI, V_LO, V_HI } = this.props;
    const cameraCalibrationEnv = this.props.namespace("H_LO").includes("CAMERA");
    return <div className="image-workspace">
      <Row>
        <Col xs={12} md={6}>
          <h4>
            <i>{t("Color Range")}</i>
          </h4>
          <label htmlFor="hue">{t("HUE")}</label>
          <Help text={t(ToolTips.COLOR_HUE_RANGE, {
            defaultLow: this.getDefault(cameraCalibrationEnv ? "H_HI" : "H_LO"),
            defaultHigh: this.getDefault(cameraCalibrationEnv ? "H_LO" : "H_HI"),
            defaultColor: cameraCalibrationEnv ? t("red") : t("green"),
          })} />
          <WeedDetectorSlider
            onRelease={this.onHslChange("H")}
            lowest={RANGES.H.LOWEST}
            highest={RANGES.H.HIGHEST}
            lowValue={Math.min(H_LO, H_HI)}
            highValue={Math.max(H_LO, H_HI)} />
          <label htmlFor="saturation">{t("SATURATION")}</label>
          <Help text={t(ToolTips.COLOR_SATURATION_RANGE, {
            defaultLow: this.getDefault("S_LO"),
            defaultHigh: this.getDefault("S_HI"),
          })} />
          <WeedDetectorSlider
            onRelease={this.onHslChange("S")}
            lowest={RANGES.S.LOWEST}
            highest={RANGES.S.HIGHEST}
            lowValue={S_LO}
            highValue={S_HI} />
          <label htmlFor="value">{t("VALUE")}</label>
          <Help text={t(ToolTips.COLOR_VALUE_RANGE, {
            defaultLow: this.getDefault("V_LO"),
            defaultHigh: this.getDefault("V_HI"),
          })} />
          <WeedDetectorSlider
            onRelease={this.onHslChange("V")}
            lowest={RANGES.V.LOWEST}
            highest={RANGES.V.HIGHEST}
            lowValue={V_LO}
            highValue={V_HI} />
        </Col>
        <Col xs={12} md={6}>
          <FarmbotColorPicker
            h={[H_LO, H_HI]}
            s={[S_LO, S_HI]}
            v={[V_LO, V_HI]}
            invertHue={this.props.invertHue} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <ExpandableHeader
            expanded={!!this.state.open}
            title={t("Processing Parameters")}
            onClick={() => this.setState({ open: !this.state.open })} />
        </Col>
      </Row>
      <Collapse isOpen={this.state.open}>
        <Row>
          <Col xs={4}>
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
          </Col>
          <Col xs={4}>
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
          </Col>
          <Col xs={4}>
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
          </Col>
        </Row>
      </Collapse>
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
