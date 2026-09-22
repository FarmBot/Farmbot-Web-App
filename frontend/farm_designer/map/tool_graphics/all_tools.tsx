import React from "react";
import { ToolType } from "farmbot/dist/resources/api_resources";
import { ToolImplementProfileProps, ToolProps } from "./interfaces";
import { Seeder, SeederImplementProfile } from "./seeder";
import { SeedBin, SeedBinImplementProfile } from "./seed_bin";
import { SeedTray } from "./seed_tray";
import { SeedTrough } from "./seed_trough";
import { SoilSensor, SoilSensorImplementProfile } from "./soil_sensor";
import { EmptySlot, StandardTool } from "./tool";
import { WateringNozzle } from "./watering_nozzle";
import { Weeder, WeederImplementProfile } from "./weeder";
import { RotaryTool, RotaryToolImplementProfile } from "./rotary_tool";

export enum ToolColor {
  rotaryTool = "rgba(238, 102, 102)",
  weeder = "rgba(238, 102, 102)",
  wateringNozzle = "rgba(40, 120, 220)",
  seeder = "rgba(240, 200, 0)",
  soilSensor = "rgba(128, 128, 128)",
  soilSensorPCB = "rgba(255, 215, 0)",
  seedBin = "rgba(128, 128, 128)",
  seedTray = "rgba(128, 128, 128)",
  none = "rgba(102, 102, 102)",
}

const TOOL_COLOR_LOOKUP: Record<ToolType, ToolColor> = {
  rotary_tool: ToolColor.rotaryTool,
  weeder: ToolColor.weeder,
  watering_nozzle: ToolColor.wateringNozzle,
  seeder: ToolColor.seeder,
  soil_sensor: ToolColor.soilSensor,
  seed_bin: ToolColor.seedBin,
  seed_tray: ToolColor.seedTray,
  seed_trough: ToolColor.seedTray,
  none: ToolColor.none,
};

export const getToolColor = (toolType: ToolType | undefined) =>
  toolType
    ? TOOL_COLOR_LOOKUP[toolType]
    : ToolColor.none;

export const Tool = (props: ToolProps) => {
  switch (props.toolType) {
    case "rotary_tool": return <RotaryTool {...props.toolProps} />;
    case "weeder": return <Weeder {...props.toolProps} />;
    case "watering_nozzle": return <WateringNozzle {...props.toolProps} />;
    case "seeder": return <Seeder {...props.toolProps} />;
    case "soil_sensor": return <SoilSensor {...props.toolProps} />;
    case "seed_bin": return <SeedBin {...props.toolProps} />;
    case "seed_tray": return <SeedTray {...props.toolProps} />;
    case "seed_trough": return <SeedTrough {...props.toolProps} />;
    case undefined: return <EmptySlot {...props.toolProps} />;
    default: return <StandardTool {...props.toolProps} />;
  }
};

/** Tool implement profile (base not included). */
export const ToolImplementProfile = (props: ToolImplementProfileProps) => {
  switch (props.toolType) {
    case "rotary_tool": return <RotaryToolImplementProfile {...props} />;
    case "weeder": return <WeederImplementProfile {...props} />;
    case "seeder": return <SeederImplementProfile {...props} />;
    case "soil_sensor": return <SoilSensorImplementProfile {...props} />;
    case "seed_bin": return <SeedBinImplementProfile {...props} />;
    default: return <g id={"no-tool-implement-profile"} />;
  }
};
