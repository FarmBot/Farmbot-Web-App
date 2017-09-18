import { MovePlantProps } from "./interfaces";
import { defensiveClone } from "../util";
import { edit } from "../api/crud";
import * as _ from "lodash";

export function movePlant(payload: MovePlantProps) {
  const tr = payload.plant;
  const update = defensiveClone(payload.plant).body;
  update.x += payload.deltaX;
  update.y += payload.deltaY;
  update.x = _.clamp(update.x, 0, payload.gridSize.x);
  update.y = _.clamp(update.y, 0, payload.gridSize.y);
  return edit(tr, update);
}
