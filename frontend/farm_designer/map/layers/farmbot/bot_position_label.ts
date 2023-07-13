import { isNumber, round } from "lodash";
import { BotPosition } from "../../../../devices/interfaces";

interface Options {
  gantryMounted?: boolean;
  rounded?: boolean;
}

export const botPositionLabel = (position: BotPosition, options?: Options) => {
  const show = (n: number | undefined) => {
    if (!isNumber(n)) { return "---"; }
    return options?.rounded ? round(n) : n;
  };
  const x = options?.gantryMounted ? "gantry" : show(position.x);
  return `(${x}, ${show(position.y)}, ${show(position.z)})`;
};
