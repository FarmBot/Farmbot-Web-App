import { isNumber } from "lodash";
import { BotPosition } from "../../../../devices/interfaces";

export function botPositionLabel(position: BotPosition) {
  const show = (n: number | undefined) => isNumber(n) ? n : "---";
  return `(${show(position.x)}, ${show(position.y)}, ${show(position.z)})`;
}
