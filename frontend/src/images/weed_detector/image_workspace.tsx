import * as React from "react";
import { FarmbotColorPicker } from "../farmbot_picker";
import { BlurableInput } from "../../ui/index";
import { ImageFlipper } from "../image_flipper";
import { HSV } from "../interfaces";
import { WeedDetectorSlider } from "./slider";
import { TaggedImage } from "../../resources/tagged_resources";
import { t } from "i18next";

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

interface Props extends NumericValues {
  onFlip(uuid: string | undefined): void;
  onProcessPhoto(image_id: number): void;
  currentImage: TaggedImage | undefined;
  images: TaggedImage[];
  onChange(key: NumericKeyName, value: number): void;
}

/** Mapping of HSV values to FBOS Env variables. */
let CHANGE_MAP: Record<HSV, [NumericKeyName, NumericKeyName]> = {
  H: ["H_LO", "H_HI"],
  S: ["S_LO", "S_HI"],
  V: ["V_LO", "V_HI"]
};

export class ImageWorkspace extends React.Component<Props, {}> {
  /** Generates a function to handle changes to blur/morph/iteration. */
  numericChange = (key: NumericKeyName) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      this.props.onChange(key, parseInt(e.currentTarget.value, 10) || 0);
    };

  maybeProcessPhoto = () => {
    let img = this.props.currentImage || this.props.images[0];
    if (img && img.body.id) {
      this.props.onProcessPhoto(img.body.id);
    }
  };

  /** This will trigger onChange callback twice. Once for (H|S|L)_HI and again
   * for (H|S|L)_LO */
  onHslChange = (key: keyof typeof CHANGE_MAP) =>
    (values: [number, number]) => {
      let keys = CHANGE_MAP[key];
      [0, 1].map(i => this.props.onChange(keys[i], values[i]));
    };

  render() {
    let { H_LO, H_HI, S_LO, S_HI, V_LO, V_HI } = this.props;

    return <div className="widget-content">
      <div className="row">
        <div className="col-md-6 col-sm-12">
          <h4>
            <i>{t("Color Range")}</i>
          </h4>
          <label htmlFor="hue">{t("HUE")}</label>
          <WeedDetectorSlider
            onChange={this.onHslChange("H")}
            onRelease={_.noop}
            lowest={RANGES.H.LOWEST}
            highest={RANGES.H.HIGHEST}
            lowValue={H_LO}
            highValue={H_HI} />
          <label htmlFor="saturation">{t("SATURATION")}</label>
          <WeedDetectorSlider
            onChange={this.onHslChange("S")}
            onRelease={_.noop}
            lowest={RANGES.S.LOWEST}
            highest={RANGES.S.HIGHEST}
            lowValue={S_LO}
            highValue={S_HI} />
          <label htmlFor="value">{t("VALUE")}</label>
          <WeedDetectorSlider
            onChange={this.onHslChange("V")}
            onRelease={_.noop}
            lowest={RANGES.V.LOWEST}
            highest={RANGES.V.HIGHEST}
            lowValue={V_LO}
            highValue={V_HI} />
        </div>
        <div className="col-md-6 col-sm-12">
          <FarmbotColorPicker
            h={[H_LO, H_HI]}
            s={[S_LO, S_HI]}
            v={[V_LO, V_HI]} />
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 col-sm-12">
          <h4>
            <i>{t("Processing Parameters")}</i>
          </h4>
        </div>

        <div className="col-md-4 col-sm-4">
          <label>{t("BLUR")}</label>
          <BlurableInput type="number"
            min={RANGES.BLUR.LOWEST}
            max={RANGES.BLUR.HIGHEST}
            onCommit={this.numericChange("blur")}
            value={"" + this.props.blur} />
        </div>

        <div className="col-md-4 col-sm-4">
          <label>{t("MORPH")}</label>
          <BlurableInput type="number"
            min={RANGES.MORPH.LOWEST}
            max={RANGES.MORPH.HIGHEST}
            onCommit={this.numericChange("morph")}
            value={"" + this.props.morph} />
        </div>
        <div className="col-md-4 col-sm-4">
          <label>{t("ITERATION")}</label>
          <BlurableInput type="number"
            min={RANGES.ITERATION.LOWEST}
            max={RANGES.ITERATION.HIGHEST}
            onCommit={this.numericChange("iteration")}
            value={"" + this.props.iteration} />
        </div>
      </div>
      {/** CHRIS HELP!!! */}
      <button
        className="green fb-button"
        style={{ "marginTop": 25 }}
        title="Scan this image for Weeds"
        onClick={this.maybeProcessPhoto}
        hidden={!this.props.images.length}
      >
        {t("Scan for Weeds")}
      </button>
      <ImageFlipper
        onFlip={this.props.onFlip}
        images={this.props.images}
        currentImage={this.props.currentImage} />
    </div>;
  }
}
