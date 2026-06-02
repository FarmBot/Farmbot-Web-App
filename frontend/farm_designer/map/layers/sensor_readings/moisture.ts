import { round } from "lodash";
import { GetColor } from "../points/interpolation_data";

export const getMoistureColor: GetColor = (value: number) => {
  const maxValue = 900;
  if (value > maxValue) { return { rgb: "rgb(0, 0, 0)", a: 0 }; }
  const r = 0;
  const g = 0;
  const b = 255;
  const a = round((0.75 * value / maxValue) ** 3, 2);
  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    a: a,
  };
};
