import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { ToolName } from "../farm_designer/map/tool_graphics/all_tools";
import { Config } from "../three_d_garden/config";
import { ThreeDTool } from "../three_d_garden/bot/components";
import { zDir, zZero } from "../three_d_garden/helpers";

export const PROMO_TOOLS = (config: Config): ThreeDTool[] => {

  const isJr = config.sizePreset == "Jr";

  const promoToolOffset = {
    x: 110 + config.bedWallThickness - config.bedXOffset,
    y: config.bedWidthOuter / 2 - config.bedYOffset,
    z: zDir(config) * (zZero(config) - 60),
  };

  return [
    {
      x: promoToolOffset.x,
      y: (isJr ? 0 : 100) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.rotaryTool,
      toolPulloutDirection: ToolPulloutDirection.NONE,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? 200 : 300) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.seedBin,
      toolPulloutDirection: ToolPulloutDirection.NONE,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? -100 : -200) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.seedTray,
      toolPulloutDirection: ToolPulloutDirection.NONE,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? -200 : -300) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.soilSensor,
      toolPulloutDirection: ToolPulloutDirection.NONE,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? 100 : 200) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.wateringNozzle,
      toolPulloutDirection: ToolPulloutDirection.NONE,
    },
    {
      x: config.x - config.bedXOffset + 140,
      y: -config.bedYOffset + 15,
      z: zDir(config) * (zZero(config) - 100),
      toolName: ToolName.seedTrough,
      toolPulloutDirection: ToolPulloutDirection.NONE,
      firstTrough: true,
    },
  ];
};
