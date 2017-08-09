import { MovePlantProps } from "./interfaces";
import { defensiveClone } from "../util";
import { edit } from "../api/crud";

export function movePlant(payload: MovePlantProps) {
  let tr = payload.plant;
  let update = defensiveClone(payload.plant).body;
  update.x += payload.deltaX;
  update.y += payload.deltaY;
  return edit(tr, update);
}
