import * as React from "react";
import { SlotWithTool, UUID } from "../../../../resources/interfaces";
import { transformXY } from "../../util";
import { MapTransformProps } from "../../interfaces";
import { ToolbaySlot, ToolNames, Tool, GantryToolSlot } from "./tool_graphics";
import { ToolLabel } from "./tool_label";
import { includes } from "lodash";
import { t } from "../../../../i18next_wrapper";
import { mapPointClickAction } from "../../actions";

export interface TSPProps {
  slot: SlotWithTool;
  botPositionX: number | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
}

export const reduceToolName = (raw: string | undefined) => {
  const lower = (raw || "").toLowerCase();
  if (raw == "Empty") { return ToolNames.emptyToolSlot; }
  if (includes(lower, "weeder")) { return ToolNames.weeder; }
  if (includes(lower, "watering nozzle")) { return ToolNames.wateringNozzle; }
  if (includes(lower, "seeder")) { return ToolNames.seeder; }
  if (includes(lower, "soil sensor")) { return ToolNames.soilSensor; }
  if (includes(lower, "seed bin")) { return ToolNames.seedBin; }
  if (includes(lower, "seed tray")) { return ToolNames.seedTray; }
  if (includes(lower, "seed trough")) { return ToolNames.seedTrough; }
  return ToolNames.tool;
};

export const ToolSlotPoint = (props: TSPProps) => {
  const { tool, toolSlot } = props.slot;
  const {
    id, x, y, pullout_direction, gantry_mounted
  } = toolSlot.body;
  const { mapTransformProps, botPositionX } = props;
  const { quadrant, xySwap } = mapTransformProps;
  const xPosition = gantry_mounted ? (botPositionX || 0) : x;
  const { qx, qy } = transformXY(xPosition, y, props.mapTransformProps);
  const toolName = tool ? tool.body.name : t("Empty");
  const hovered = toolSlot.uuid === props.hoveredToolSlot;
  const toolProps = {
    x: qx,
    y: qy,
    hovered,
    dispatch: props.dispatch,
    uuid: toolSlot.uuid,
    xySwap,
  };
  return <g id={"toolslot-" + id}
    onClick={mapPointClickAction(props.dispatch, toolSlot.uuid,
      `/app/designer/tool-slots/${id}`)}>
    {pullout_direction && !gantry_mounted &&
      <ToolbaySlot
        id={id}
        x={qx}
        y={qy}
        pulloutDirection={pullout_direction}
        quadrant={quadrant}
        occupied={!!props.slot.tool}
        xySwap={xySwap} />}

    {gantry_mounted && <GantryToolSlot x={qx} y={qy} xySwap={xySwap} />}

    {(props.slot.tool || (!pullout_direction && !gantry_mounted)) &&
      <Tool
        tool={reduceToolName(toolName)}
        toolProps={toolProps} />}

    <ToolLabel
      toolName={toolName}
      hovered={hovered}
      x={qx}
      y={qy}
      pulloutDirection={pullout_direction}
      gantryMounted={gantry_mounted}
      quadrant={quadrant}
      xySwap={xySwap} />
  </g>;
};
