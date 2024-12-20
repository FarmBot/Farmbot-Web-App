import React from "react";
import { SlotWithTool, UUID } from "../../../../resources/interfaces";
import { transformXY } from "../../util";
import { MapTransformProps } from "../../interfaces";
import { RotatedTool } from "./tool_graphics";
import { ToolLabel } from "./tool_label";
import { t } from "../../../../i18next_wrapper";
import { mapPointClickAction, selectPoint, setHoveredPlant } from "../../actions";
import { isToolFlipped } from "../../../../tools/tool_slot_edit_components";
import { ToolbaySlot } from "../../tool_graphics/slot";
import { GantryToolSlot } from "../../tool_graphics/seed_trough";
import { reduceToolName } from "../../tool_graphics/all_tools";
import { Path } from "../../../../internal_urls";
import { Actions } from "../../../../constants";
import { Circle } from "../plants/circle";
import { useNavigate } from "react-router";

export interface TSPProps {
  slot: SlotWithTool;
  botPositionX: number | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
  current: boolean;
  animate: boolean;
}

export const ToolSlotPoint = (props: TSPProps) => {
  const { tool, toolSlot } = props.slot;
  const {
    id, x, y, pullout_direction, gantry_mounted
  } = toolSlot.body;
  const { mapTransformProps, botPositionX, current, animate } = props;
  const { quadrant, xySwap } = mapTransformProps;
  const xPosition = gantry_mounted ? (botPositionX || 0) : x;
  const { qx, qy } = transformXY(xPosition, y, props.mapTransformProps);
  const toolName = tool ? tool.body.name : t("Empty");
  const hovered = toolSlot.uuid === props.hoveredToolSlot;
  const toolProps = {
    toolName,
    x: qx,
    y: qy,
    hovered,
    dispatch: props.dispatch,
    uuid: toolSlot.uuid,
    pulloutDirection: pullout_direction,
    flipped: isToolFlipped(toolSlot.body.meta),
    toolTransformProps: { quadrant, xySwap },
  };
  const selected = current || hovered;
  const iconHover = (action: "start" | "end") => () => {
    const hover = action === "start";
    props.dispatch({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: hover ? toolSlot.uuid : undefined
    });
  };
  const navigate = useNavigate();
  return <g id={"toolslot-" + id}
    onMouseEnter={iconHover("start")}
    onMouseLeave={iconHover("end")}
    onClick={() => {
      props.dispatch(selectPoint([toolSlot.uuid]));
      mapPointClickAction(navigate, props.dispatch, toolSlot.uuid,
        Path.toolSlots(id))();
      props.dispatch(setHoveredPlant(undefined));
    }}>
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

    {selected &&
      <g id="selected-tool-slot-indicator">
        <Circle
          className={`tool-slot-indicator ${animate ? "animate" : ""}`}
          x={qx}
          y={qy}
          r={40 / 1.2}
          selected={true} />
      </g>}

    {(props.slot.tool || (!pullout_direction && !gantry_mounted)) &&
      <RotatedTool
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
