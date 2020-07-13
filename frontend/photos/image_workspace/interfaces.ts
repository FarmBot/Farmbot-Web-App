import { WD_ENV } from "../remote_env/interfaces";

/** Hue, Saturation, Value */
export type HSV = "H" | "S" | "V";

/** A simple range object. */
export interface HiLo {
  hi: number;
  lo: number;
}

export interface FarmbotPickerProps {
  h: [number, number];
  s: [number, number];
  v: [number, number];
  invertHue?: boolean;
}

export interface EnvSliderProps {
  name: HSV;
  env: Partial<WD_ENV>;
  onChange?: (key: HSV, val: [number, number]) => void;
}

export interface EnvSliderState extends Partial<HiLo> {
  sliding: boolean;
}
