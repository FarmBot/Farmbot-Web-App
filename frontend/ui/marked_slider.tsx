import React from "react";
import { Slider, MultiSlider } from "@blueprintjs/core";
import { TaggedImage } from "farmbot";

export interface MarkedSliderProps<T> {
  min: number;
  max: number;
  labelStepSize: number;
  value: number;
  onChange?(value: number): void
  onRelease?(value: number): void
  labelRenderer(value: number): string;
  items?: T[];
  itemValue(image: T): number;
  itemLabelRenderer?(value: number): string;
  vertical?: boolean;
}

export function MarkedSlider<T = TaggedImage>(props: MarkedSliderProps<T>) {
  return <div className={`sliders ${props.vertical ? "vertical" : ""}`}>
    <MultiSlider
      className={`data-slider ${props.vertical ? "vertical" : ""}`}
      vertical={props.vertical}
      min={props.min}
      max={props.max}
      labelRenderer={props.itemLabelRenderer || false}
      showTrackFill={false}>
      {props.items?.map((item, index) =>
        <MultiSlider.Handle key={index}
          className={"slider-image"}
          type={"start"}
          value={props.itemValue(item)} />)}
    </MultiSlider>
    <Slider
      className={`input-slider ${props.vertical ? "vertical" : ""}`}
      vertical={props.vertical}
      min={props.min}
      max={props.max}
      labelStepSize={props.labelStepSize}
      value={props.value}
      onChange={props.onChange}
      onRelease={props.onRelease}
      labelRenderer={props.labelRenderer}
      showTrackFill={false} />
  </div>;
}
