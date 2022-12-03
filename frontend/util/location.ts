import { BotLocationData } from "../devices/interfaces";
import { forceOnline } from "../devices/must_be_online";
import { betterMerge } from "./util";

export function validBotLocationData(
  botLocationData: BotLocationData | undefined): BotLocationData {
  return forceOnline()
    ? {
      position: { x: 0, y: 0, z: 0 },
      scaled_encoders: { x: 0, y: 0, z: 0 },
      raw_encoders: { x: 0, y: 0, z: 0 },
    }
    : betterMerge({
      position: { x: undefined, y: undefined, z: undefined },
      scaled_encoders: { x: undefined, y: undefined, z: undefined },
      raw_encoders: { x: undefined, y: undefined, z: undefined },
    }, botLocationData);
}
