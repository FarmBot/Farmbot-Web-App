import React from "react";
import { BotOriginQuadrant } from "../../../interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { Actions } from "../../../../constants";
import { TaggedToolSlotPointer } from "farmbot";
import { noop } from "lodash";
import { ToolTransformProps } from "../../../../tools/interfaces";
import { isToolFlipped } from "../../../../tools/tool_slot_edit_components";
import { ToolbaySlot } from "../../tool_graphics/slot";
import { GantryToolSlot } from "../../tool_graphics/seed_trough";
import { ToolGraphicProps, ToolProps } from "../../tool_graphics/interfaces";
import { reduceToolName, Tool, ToolName } from "../../tool_graphics/all_tools";

export const toolbaySlotAngle = (
  pulloutDirection: ToolPulloutDirection,
  quadrant: BotOriginQuadrant,
  xySwap: boolean) => {
  const rawAngle = () => {
    const direction = pulloutDirection + (xySwap ? 2 : 0);
    switch (direction > 4 ? direction % 4 : direction) {
      case ToolPulloutDirection.POSITIVE_X: return 0;
      case ToolPulloutDirection.NEGATIVE_X: return 180;
      case ToolPulloutDirection.NEGATIVE_Y: return 90;
      case ToolPulloutDirection.POSITIVE_Y: return 270;
      default: return 0;
    }
  };
  const adjustAngle = (angle: number) => {
    const horizontal = angle % 180 === 0;
    switch (quadrant) {
      case 1: return angle + 180;
      case 2: return horizontal ? angle : angle + 180;
      case 3: return angle;
      case 4: return horizontal ? angle + 180 : angle;
      default: return angle;
    }
  };
  return (adjustAngle(rawAngle())) % 360;
};

export const RotatedTool = (props: ToolProps) => {
  const { uuid, x, y, pulloutDirection, dispatch, flipped } = props.toolProps;
  const { quadrant, xySwap } = props.toolProps.toolTransformProps;
  const pullDirection = pulloutDirection || ToolPulloutDirection.POSITIVE_X;
  const angle = toolbaySlotAngle(pullDirection, quadrant, xySwap)
    + (flipped ? 180 : 0);
  return <g id={`rotated-tool-${uuid}`}>
    <defs id="unrotated-tool-source">
      <g id={`unrotated-tool-${uuid}`}>
        <Tool tool={props.tool}
          toolProps={props.toolProps} />
      </g>
    </defs>

    <use xlinkHref={`#unrotated-tool-${uuid}`}
      onMouseOver={() => dispatch(setToolHover(uuid))}
      onMouseLeave={() => dispatch(setToolHover(undefined))}
      transform={`rotate(${angle - 90}, ${x}, ${y})`} />
  </g>;
};

export const setToolHover = (payload: string | undefined) =>
  ({ type: Actions.HOVER_TOOL_SLOT, payload });

export interface ToolSlotSVGProps {
  toolSlot: TaggedToolSlotPointer;
  toolName: string | undefined;
  toolTransformProps: ToolTransformProps;
}

export const ToolSlotSVG = (props: ToolSlotSVGProps) => {
  const toolProps: ToolGraphicProps = {
    x: 0, y: 0,
    hovered: false,
    dispatch: noop,
    uuid: "panel-" + props.toolSlot.uuid,
    pulloutDirection: props.toolSlot.body.pullout_direction,
    flipped: isToolFlipped(props.toolSlot.body.meta),
    toolTransformProps: {
      quadrant: props.toolTransformProps.quadrant,
      xySwap: props.toolTransformProps.xySwap,
    },
  };
  const pulloutDirection = props.toolSlot.body.pullout_direction;
  return props.toolSlot.body.gantry_mounted
    ? <svg width="3rem" height="3rem" viewBox={"-25 0 50 1"}>
      <GantryToolSlot x={0} y={0} xySwap={props.toolTransformProps.xySwap} />
      {props.toolSlot.body.tool_id &&
        <RotatedTool tool={reduceToolName(props.toolName)} toolProps={toolProps} />}
    </svg>
    : <svg width="3rem" height="3rem" viewBox={"-50 0 100 1"}>
      {pulloutDirection &&
        <ToolbaySlot
          id={-(props.toolSlot.body.id || 1)}
          x={0}
          y={0}
          pulloutDirection={pulloutDirection}
          quadrant={props.toolTransformProps.quadrant}
          occupied={false}
          xySwap={props.toolTransformProps.xySwap} />}
      {(props.toolSlot.body.tool_id || !pulloutDirection) &&
        <RotatedTool tool={reduceToolName(props.toolName)} toolProps={toolProps} />}
    </svg>;
};

export interface ToolSVGProps {
  toolName: string | undefined;
}

export const ToolSVG = (props: ToolSVGProps) => {
  const toolProps = {
    x: 0, y: 0, hovered: false, dispatch: noop, uuid: "", flipped: false,
    pulloutDirection: 0, toolTransformProps: { xySwap: false, quadrant: 2 },
  };
  const viewBox = reduceToolName(props.toolName) === ToolName.seedTrough
    ? "-25 0 50 1"
    : "-40 0 80 1";
  return <svg width="3rem" height="3rem" viewBox={viewBox}>
    <Tool tool={reduceToolName(props.toolName)} toolProps={toolProps} />
  </svg>;
};
