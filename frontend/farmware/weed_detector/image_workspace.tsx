import * as React from "react";
import { FarmbotColorPicker } from "./farmbot_picker";
import { BlurableInput, Row, Col } from "../../ui/index";
import { ImageFlipper } from "../images/image_flipper";
import { HSV } from "./interfaces";
import { WeedDetectorSlider } from "./slider";
import { TaggedImage } from "farmbot";
import { PhotoFooter } from "../images/photos";
import { parseIntInput } from "../../util";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";

const RANGES = {
  H: { LOWEST: 0, HIGHEST: 179 },
  S: { LOWEST: 0, HIGHEST: 255 },
  V: { LOWEST: 0, HIGHEST: 255 },
  BLUR: { LOWEST: 0, HIGHEST: 100 },
  MORPH: { LOWEST: 0, HIGHEST: 100 },
  ITERATION: { LOWEST: 0, HIGHEST: 100 },
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

type NumericKeyName = keyof NumericValues;

export interface ImageWorkspaceProps extends NumericValues {
  onFlip(uuid: string | undefined): void;
  onProcessPhoto(image_id: number): void;
  currentImage: TaggedImage | undefined;
  images: TaggedImage[];
  onChange(key: NumericKeyName, value: number): void;
  invertHue?: boolean;
  botOnline: boolean;
  timeSettings: TimeSettings;
}

/** Mapping of HSV values to FBOS Env variables. */
const CHANGE_MAP: Record<HSV, [NumericKeyName, NumericKeyName]> = {
  H: ["H_LO", "H_HI"],
  S: ["S_LO", "S_HI"],
  V: ["V_LO", "V_HI"]
};

export class ImageWorkspace extends React.Component<ImageWorkspaceProps, {}> {
  /** Generates a function to handle changes to blur/morph/iteration. */
  numericChange = (key: NumericKeyName) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      this.props.onChange(key, parseIntInput(e.currentTarget.value) || 0);
    };

  maybeProcessPhoto = () => {
    const img = this.props.currentImage || this.props.images[0];
    if (img && img.body.id) {
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

  render() {
    const { H_LO, H_HI, S_LO, S_HI, V_LO, V_HI } = this.props;

    return <div className="widget-content">
      <Row>
        <Col xs={12} md={6}>
          <h4>
            <i>{t("Color Range")}</i>
          </h4>
          <label htmlFor="hue">{t("HUE")}</label>
          <WeedDetectorSlider
            onRelease={this.onHslChange("H")}
            lowest={RANGES.H.LOWEST}
            highest={RANGES.H.HIGHEST}
            lowValue={Math.min(H_LO, H_HI)}
            highValue={Math.max(H_LO, H_HI)} />
          <label htmlFor="saturation">{t("SATURATION")}</label>
          <WeedDetectorSlider
            onRelease={this.onHslChange("S")}
            lowest={RANGES.S.LOWEST}
            highest={RANGES.S.HIGHEST}
            lowValue={S_LO}
            highValue={S_HI} />
          <label htmlFor="value">{t("VALUE")}</label>
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
          <h4>
            <i>{t("Processing Parameters")}</i>
          </h4>
        </Col>

        <Col xs={4}>
          <label>{t("BLUR")}</label>
          <BlurableInput type="number"
            min={RANGES.BLUR.LOWEST}
            max={RANGES.BLUR.HIGHEST}
            onCommit={this.numericChange("blur")}
            value={"" + this.props.blur} />
        </Col>

        <Col xs={4}>
          <label>{t("MORPH")}</label>
          <BlurableInput type="number"
            min={RANGES.MORPH.LOWEST}
            max={RANGES.MORPH.HIGHEST}
            onCommit={this.numericChange("morph")}
            value={"" + this.props.morph} />
        </Col>
        <Col xs={4}>
          <label>{t("ITERATION")}</label>
          <BlurableInput type="number"
            min={RANGES.ITERATION.LOWEST}
            max={RANGES.ITERATION.HIGHEST}
            onCommit={this.numericChange("iteration")}
            value={"" + this.props.iteration} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <button
            className="green fb-button"
            title="Scan this image"
            onClick={this.maybeProcessPhoto}
            disabled={this.props.botOnline}
            hidden={!this.props.images.length} >
            {t("Scan image")}
          </button>
        </Col>
      </Row>
      <ImageFlipper
        onFlip={this.props.onFlip}
        images={this.props.images}
        currentImage={this.props.currentImage} />
      <PhotoFooter
        image={this.props.currentImage}
        timeSettings={this.props.timeSettings} />
    </div>;
  }
}
