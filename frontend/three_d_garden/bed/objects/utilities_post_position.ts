import { Config } from "../../config";
import { threeSpace } from "../../helpers";

type UtilitiesPostPositionConfig = Pick<
  Config,
  "bedHeight" | "bedLengthOuter" | "bedWidthOuter" | "bedZOffset"
>;

export type UtilitiesPostPosition = [number, number, number];

export const WIFI_ROUTER_LOCAL_Z = 165;
export const UTILITIES_POST_SIZE = 100;
const UTILITIES_POST_LOCAL_Z = 150;

export const getUtilitiesPostWorldPosition = (
  config: UtilitiesPostPositionConfig,
): UtilitiesPostPosition => [
  threeSpace(config.bedLengthOuter + 600, config.bedLengthOuter),
  threeSpace(UTILITIES_POST_SIZE / 2, config.bedWidthOuter),
  -config.bedHeight - config.bedZOffset + UTILITIES_POST_LOCAL_Z,
];

export const getWifiRouterWorldPosition = (
  config: UtilitiesPostPositionConfig,
): UtilitiesPostPosition => {
  const [x, y, z] = getUtilitiesPostWorldPosition(config);
  return [x, y, z + WIFI_ROUTER_LOCAL_Z];
};
