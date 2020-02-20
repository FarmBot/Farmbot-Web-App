import * as React from "react";
import { SlotWithTool, UUID } from "../../../../resources/interfaces";
import { transformXY } from "../../util";
import { MapTransformProps } from "../../interfaces";
import { ToolbaySlot, ToolNames, Tool, GantryToolSlot } from "./tool_graphics";
import { ToolLabel } from "./tool_label";
import { includes } from "lodash";
import { DevSettings } from "../../../../account/dev/dev_support";
import { history } from "../../../../history";

export interface TSPProps {
  slot: SlotWithTool;
  botPositionX: number | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
}

const reduceToolName = (raw: string | undefined) => {
  const lower = (raw || "").toLowerCase();
  if (includes(lower, "seed bin")) { return ToolNames.seedBin; }
  if (includes(lower, "seed tray")) { return ToolNames.seedTray; }
  if (includes(lower, "seed trough")) { return ToolNames.seedTrough; }
  return ToolNames.tool;
};

export const ToolSlotPoint = (props: TSPProps) => {
  const {
    id, x, y, pullout_direction, gantry_mounted
  } = props.slot.toolSlot.body;
  const { mapTransformProps, botPositionX } = props;
  const { quadrant, xySwap } = mapTransformProps;
  const xPosition = gantry_mounted ? (botPositionX || 0) : x;
  const { qx, qy } = transformXY(xPosition, y, props.mapTransformProps);
  const toolName = props.slot.tool ? props.slot.tool.body.name : "empty";
  const hovered = props.slot.toolSlot.uuid === props.hoveredToolSlot;
  const toolProps = {
    x: qx,
    y: qy,
    hovered,
    dispatch: props.dispatch,
    uuid: props.slot.toolSlot.uuid,
    xySwap,
  };
  return <g id={"toolslot-" + id}
    onClick={() => !DevSettings.futureFeaturesEnabled() &&
      history.push(`/app/designer/tool-slots/${id}`)}>
    {pullout_direction &&
      <ToolbaySlot
        id={id}
        x={qx}
        y={qy}
        pulloutDirection={pullout_direction}
        quadrant={quadrant}
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
      quadrant={quadrant}
      xySwap={xySwap} />
  </g>;
};
