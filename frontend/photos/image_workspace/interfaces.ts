/** Hue, Saturation, Value */
export type HSV = "H" | "S" | "V";

export interface FarmbotPickerProps {
  h: [number, number];
  s: [number, number];
  v: [number, number];
  invertHue?: boolean;
}
