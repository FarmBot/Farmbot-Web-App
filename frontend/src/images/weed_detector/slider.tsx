import * as React from "react";
import { RangeSlider } from "@blueprintjs/core/dist/components/slider/rangeSlider";

interface SliderProps {
  onChange(value: [number, number]): void;
  onRelease(value: [number, number]): void;
  highest: number;
  lowest: number;
  lowValue: number;
  highValue: number;
}

export function WeedDetectorSlider({
  onChange,
  highest,
  lowest,
  lowValue,
  highValue,
  onRelease
}: SliderProps) {
  return <RangeSlider
    onChange={onChange}
    onRelease={onRelease}
    labelStepSize={highest}
    min={lowest}
    max={highest}
    value={[lowValue, highValue]} />;
}
