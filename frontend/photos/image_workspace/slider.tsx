import React from "react";
import { RangeSlider } from "@blueprintjs/core";
import { NumericKeyName, NumericValues } from ".";

export interface SliderProps {
  onRelease(value: [number, number]): void;
  highest: number;
  lowest: number;
  lowValue: number;
  highValue: number;
  className?: string;
}

export const WeedDetectorSlider = (props: SliderProps) => {
  const [lowValue, setLowValue] = React.useState<number | undefined>(undefined);
  const [highValue, setHighValue] = React.useState<number | undefined>(undefined);

  const onRelease = (i: [number, number]) => {
    props.onRelease(i);
    setTimeout(() => {
      setLowValue(undefined);
      setHighValue(undefined);
    }, 500);
  };

  return <RangeSlider
    className={props.className}
    onChange={i => {
      setHighValue(i[1]);
      setLowValue(i[0]);
    }}
    onRelease={onRelease}
    labelStepSize={props.highest}
    min={props.lowest}
    max={props.highest}
    value={[lowValue ?? props.lowValue, highValue ?? props.highValue]} />;
};

/** Hue, Saturation, Value */
export type HSV = "H" | "S" | "V";

/** Mapping of HSV values to FBOS Env variables. */
const CHANGE_MAP: Record<HSV, [NumericKeyName, NumericKeyName]> = {
  H: ["H_LO", "H_HI"],
  S: ["S_LO", "S_HI"],
  V: ["V_LO", "V_HI"]
};

export interface OnHslChangeProps extends NumericValues {
  onChange(key: NumericKeyName, value: number): void;
}

/** This will trigger onChange callback only when necessary, at most twice.
 * (H|S|L)_HI and (H|S|L)_LO */
export const onHslChange = (props: OnHslChangeProps) =>
  (key: keyof typeof CHANGE_MAP) =>
    (values: [number, number]) => {
      const keys = CHANGE_MAP[key];
      [0, 1].map(i => {
        if (values[i] !== props[keys[i]]) {
          props.onChange(keys[i], values[i]);
        }
      });
    };
