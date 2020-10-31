import React from "react";
import { Slider, MultiSlider } from "@blueprintjs/core";
import { TaggedImage } from "farmbot";

export interface MarkedSliderProps {
  min: number;
  max: number;
  labelStepSize: number;
  value: number;
  onChange(value: number): void
  onRelease?(value: number): void
  labelRenderer(value: number): string;
  images?: TaggedImage[];
  imageIndex(image: TaggedImage): number;
}

export const MarkedSlider = (props: MarkedSliderProps) =>
  <div className={"sliders"}>
    <MultiSlider
      className={"data-slider"}
      min={props.min}
      max={props.max}
      labelRenderer={false}
      showTrackFill={false}>
      {props.images?.map((image, index) =>
        <MultiSlider.Handle key={index}
          className={"slider-image"}
          type={"start"}
          value={props.imageIndex(image)} />)}
    </MultiSlider>
    <Slider
      className={"input-slider"}
      min={props.min}
      max={props.max}
      labelStepSize={props.labelStepSize}
      value={props.value}
      onChange={props.onChange}
      onRelease={props.onRelease}
      labelRenderer={props.labelRenderer}
      showTrackFill={false} />
  </div>;
