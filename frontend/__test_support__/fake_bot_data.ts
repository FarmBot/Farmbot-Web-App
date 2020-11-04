import { BotLocationData } from "../devices/interfaces";
import { BotSize } from "../farm_designer/map/interfaces";

export const fakeBotSize = (): BotSize => ({
  x: { value: 2900, isDefault: false },
  y: { value: 1400, isDefault: false },
  z: { value: 400, isDefault: true },
});

export const fakeBotLocationData = (): BotLocationData => ({
  position: { x: undefined, y: undefined, z: undefined },
  scaled_encoders: { x: undefined, y: undefined, z: undefined },
  raw_encoders: { x: undefined, y: undefined, z: undefined },
});
