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
import { Path } from "../../../../internal_urls";
import { Actions } from "../../../../constants";
import { Circle } from "../plants/circle";
import { useNavigate } from "react-router";
import { MountStage } from "farmbot/dist/resources/api_resources";
import { BotPosition } from "../../../../devices/interfaces";
import { resolveMountPosition } from "../../../../tools/mount_stage";

export interface TSPProps {
  slot: SlotWithTool;
  botPosition: BotPosition;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
  current: boolean;
  animate: boolean;
}

export const ToolSlotPoint = (props: TSPProps) => {
  const { tool, toolSlot } = props.slot;
  const {
    id, pullout_direction, mount_stage,
  } = toolSlot.body;
  const mounted = mount_stage != MountStage.NONE;
  const { mapTransformProps, current, animate } = props;
  const { quadrant, xySwap } = mapTransformProps;
  const position = resolveMountPosition(
    toolSlot.body, props.botPosition, mount_stage);
  const { qx, qy } = transformXY(
    position.x, position.y, props.mapTransformProps);
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
    {pullout_direction && !mounted &&
      <ToolbaySlot
        id={id}
        x={qx}
        y={qy}
        pulloutDirection={pullout_direction}
        quadrant={quadrant}
        occupied={!!props.slot.tool}
        xySwap={xySwap} />}

    {mounted && <GantryToolSlot x={qx} y={qy} xySwap={xySwap} />}

    {selected &&
      <g id="selected-tool-slot-indicator">
        <Circle
          className={`tool-slot-indicator ${animate ? "animate" : ""}`}
          x={qx}
          y={qy}
          r={40 / 1.2}
          selected={true} />
      </g>}

    {(props.slot.tool || (!pullout_direction && !mounted)) &&
      <RotatedTool
        toolType={tool?.body.type}
        toolProps={toolProps} />}

    <ToolLabel
      toolName={toolName}
      hovered={hovered}
      x={qx}
      y={qy}
      pulloutDirection={pullout_direction}
      mountStage={mount_stage}
      quadrant={quadrant}
      xySwap={xySwap} />
  </g>;
};
