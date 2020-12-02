import React from "react";
import { includes } from "lodash";
import { ToolImplementProfileProps, ToolProps } from "./interfaces";
import { Seeder, SeederImplementProfile } from "./seeder";
import { SeedBin, SeedBinImplementProfile } from "./seed_bin";
import { SeedTray } from "./seed_tray";
import { SeedTrough } from "./seed_trough";
import { SoilSensor, SoilSensorImplementProfile } from "./soil_sensor";
import { EmptySlot, StandardTool } from "./tool";
import { WateringNozzle } from "./watering_nozzle";
import { Weeder, WeederImplementProfile } from "./weeder";

export enum ToolColor {
  weeder = "rgba(238, 102, 102)",
  wateringNozzle = "rgba(40, 120, 220)",
  seeder = "rgba(240, 200, 0)",
  soilSensor = "rgba(128, 128, 128)",
  soilSensorPCB = "rgba(255, 215, 0)",
  seedBin = "rgba(128, 128, 128)",
  seedTray = "rgba(128, 128, 128)",
  none = "rgba(102, 102, 102)",
}

export enum ToolName {
  weeder = "weeder",
  wateringNozzle = "wateringNozzle",
  seeder = "seeder",
  soilSensor = "soilSensor",
  seedBin = "seedBin",
  seedTray = "seedTray",
  seedTrough = "seedTrough",
  tool = "tool",
  emptyToolSlot = "emptyToolSlot",
}

const TOOL_COLOR_LOOKUP: Record<ToolName, ToolColor> = {
  [ToolName.weeder]: ToolColor.weeder,
  [ToolName.wateringNozzle]: ToolColor.wateringNozzle,
  [ToolName.seeder]: ToolColor.seeder,
  [ToolName.soilSensor]: ToolColor.soilSensor,
  [ToolName.seedBin]: ToolColor.seedBin,
  [ToolName.seedTray]: ToolColor.seedTray,
  [ToolName.seedTrough]: ToolColor.seedTray,
  [ToolName.emptyToolSlot]: ToolColor.none,
  [ToolName.tool]: ToolColor.none,
};

export const reduceToolName = (raw: string | undefined) => {
  const lower = (raw || "").toLowerCase();
  if (raw == "Empty") { return ToolName.emptyToolSlot; }
  if (includes(lower, "weeder")) { return ToolName.weeder; }
  if (includes(lower, "watering nozzle")) { return ToolName.wateringNozzle; }
  if (includes(lower, "seeder")) { return ToolName.seeder; }
  if (includes(lower, "soil sensor")) { return ToolName.soilSensor; }
  if (includes(lower, "seed bin")) { return ToolName.seedBin; }
  if (includes(lower, "seed tray")) { return ToolName.seedTray; }
  if (includes(lower, "seed trough")) { return ToolName.seedTrough; }
  return ToolName.tool;
};

export const getToolColor = (toolName: string | undefined) =>
  TOOL_COLOR_LOOKUP[reduceToolName(toolName)];

export const Tool = (props: ToolProps) => {
  switch (props.tool) {
    case ToolName.weeder: return <Weeder {...props.toolProps} />;
    case ToolName.wateringNozzle: return <WateringNozzle {...props.toolProps} />;
    case ToolName.seeder: return <Seeder {...props.toolProps} />;
    case ToolName.soilSensor: return <SoilSensor {...props.toolProps} />;
    case ToolName.seedBin: return <SeedBin {...props.toolProps} />;
    case ToolName.seedTray: return <SeedTray {...props.toolProps} />;
    case ToolName.seedTrough: return <SeedTrough {...props.toolProps} />;
    case ToolName.emptyToolSlot: return <EmptySlot {...props.toolProps} />;
    default: return <StandardTool {...props.toolProps} />;
  }
};

/** Tool implement profile (base not included). */
export const ToolImplementProfile = (props: ToolImplementProfileProps) => {
  switch (reduceToolName(props.toolName)) {
    case ToolName.weeder: return <WeederImplementProfile {...props} />;
    case ToolName.seeder: return <SeederImplementProfile {...props} />;
    case ToolName.soilSensor: return <SoilSensorImplementProfile {...props} />;
    case ToolName.seedBin: return <SeedBinImplementProfile {...props} />;
    default: return <g id={"no-tool-implement-profile"} />;
  }
};
