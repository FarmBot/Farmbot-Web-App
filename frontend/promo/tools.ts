import {
  MountStage, ToolPulloutDirection, ToolType,
} from "farmbot/dist/resources/api_resources";
import { Config, PositionConfig } from "../three_d_garden/config";
import { ThreeDTool } from "../three_d_garden/bot/components";
import { zDir, zZero } from "../three_d_garden/helpers";
import { getBotVersion } from "../three_d_garden/bot/bot_versions";

export const PROMO_TOOLS =
  (config: Config, configPosition: PositionConfig): ThreeDTool[] => {

    const isJr = config.sizePreset == "Jr";
    const isV19 = getBotVersion(config.kitVersion).number == "v1.9";

    const promoToolOffset = {
      x: 110 + config.bedWallThickness - config.bedXOffset,
      y: config.bedWidthOuter / 2 - config.bedYOffset,
      z: zDir(config) * (zZero(config) - 60),
    };

    const tools: { y: number; toolType: ToolType }[] = isV19
      ? [
        { y: -200, toolType: "seed_tray" },
        { y: -100, toolType: "soil_sensor" },
        { y: 0, toolType: "seeder" },
        { y: 100, toolType: "rotary_tool" },
        { y: 200, toolType: "seed_bin" },
      ]
      : [
        { y: isJr ? 0 : 100, toolType: "rotary_tool" },
        { y: isJr ? 200 : 300, toolType: "seed_bin" },
        { y: isJr ? -100 : -200, toolType: "seed_tray" },
        { y: isJr ? -200 : -300, toolType: "soil_sensor" },
        { y: isJr ? 100 : 200, toolType: "watering_nozzle" },
      ];

    return [
      ...tools.map(tool => ({
        x: promoToolOffset.x,
        y: tool.y + promoToolOffset.y,
        z: promoToolOffset.z,
        mount_offset_x: 0,
        mount_offset_y: 0,
        mount_offset_z: 0,
        toolId: undefined,
        toolType: tool.toolType,
        toolPulloutDirection: ToolPulloutDirection.NONE,
        mountStage: MountStage.NONE,
        mountFrame: "stationary" as const,
      })),
      {
        x: configPosition.x - config.bedXOffset + 140,
        y: -config.bedYOffset + 15,
        z: zDir(config) * (zZero(config) - 100),
        mount_offset_x: 0,
        mount_offset_y: 0,
        mount_offset_z: 0,
        toolId: undefined,
        toolType: "seed_trough",
        toolPulloutDirection: ToolPulloutDirection.NONE,
        mountStage: MountStage.X,
        firstTrough: true,
        mountFrame: "gantry" as const,
      },
    ];
  };
