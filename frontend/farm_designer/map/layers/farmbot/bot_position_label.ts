import { isNumber } from "lodash";
import { BotPosition } from "../../../../devices/interfaces";

export const botPositionLabel =
  (position: BotPosition, gantryMounted?: boolean) => {
    const show = (n: number | undefined) => isNumber(n) ? n : "---";
    const x = gantryMounted ? "gantry" : show(position.x);
    return `(${x}, ${show(position.y)}, ${show(position.z)})`;
  };
