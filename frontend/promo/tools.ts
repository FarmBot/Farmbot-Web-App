import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { ToolName } from "../farm_designer/map/tool_graphics/all_tools";
import { Config, PositionConfig } from "../three_d_garden/config";
import { ThreeDTool } from "../three_d_garden/bot/components";
import { zDir, zZero } from "../three_d_garden/helpers";

export const PROMO_TOOLS =
  (config: Config, configPosition: PositionConfig): ThreeDTool[] => {

    const isJr = config.sizePreset == "Jr";
    const isV19 = config.kitVersion == "v1.9";

    const promoToolOffset = {
      x: 110 + config.bedWallThickness - config.bedXOffset,
      y: config.bedWidthOuter / 2 - config.bedYOffset,
      z: zDir(config) * (zZero(config) - 60),
    };

    const tools = isV19
      ? [
        { y: -200, toolName: ToolName.seedTray },
        { y: -100, toolName: ToolName.soilSensor },
        { y: 0, toolName: ToolName.seeder },
        { y: 100, toolName: ToolName.rotaryTool },
        { y: 200, toolName: ToolName.seedBin },
      ]
      : [
        { y: isJr ? 0 : 100, toolName: ToolName.rotaryTool },
        { y: isJr ? 200 : 300, toolName: ToolName.seedBin },
        { y: isJr ? -100 : -200, toolName: ToolName.seedTray },
        { y: isJr ? -200 : -300, toolName: ToolName.soilSensor },
        { y: isJr ? 100 : 200, toolName: ToolName.wateringNozzle },
      ];

    return [
      ...tools.map(tool => ({
        x: promoToolOffset.x,
        y: tool.y + promoToolOffset.y,
        z: promoToolOffset.z,
        toolName: tool.toolName,
        toolPulloutDirection: ToolPulloutDirection.NONE,
      })),
      {
        x: configPosition.x - config.bedXOffset + 140,
        y: -config.bedYOffset + 15,
        z: zDir(config) * (zZero(config) - 100),
        toolName: ToolName.seedTrough,
        toolPulloutDirection: ToolPulloutDirection.NONE,
        firstTrough: true,
      },
    ];
  };
