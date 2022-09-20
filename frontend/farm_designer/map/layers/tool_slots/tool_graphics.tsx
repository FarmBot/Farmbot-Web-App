import React from "react";
import { t } from "../../../../i18next_wrapper";
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
import { reduceToolName, Tool } from "../../tool_graphics/all_tools";
import {
  getToolDirection, slotPulloutAxis, ToolProfile,
} from "../../profile/tools";
import { ToolDimensions } from "../../tool_graphics/tool";

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
  profile?: boolean;
  size?: number;
}

export const ToolSlotSVG = (props: ToolSlotSVGProps) => {
  const toolProps: ToolGraphicProps = {
    toolName: props.toolName,
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
  const size = `${props.size || 3}rem`;
  return props.toolSlot.body.gantry_mounted
    ? <svg width={size} height={size} viewBox={"-40 0 80 1"}>
      <GantryToolSlot x={0} y={0} xySwap={props.toolTransformProps.xySwap} />
      {props.toolSlot.body.tool_id &&
        <RotatedTool
          tool={reduceToolName(props.toolName)}
          toolProps={toolProps} />}
    </svg>
    : <div className={"tool-svg"}>
      <div className={"top"}>
        <svg width={size} height={size} viewBox={"-50 0 100 1"}>
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
            <RotatedTool
              tool={reduceToolName(props.toolName)}
              toolProps={toolProps} />}
        </svg>
        {props.profile && <p>{t("top")}</p>}
      </div>
      {props.profile &&
        <div className={"front"}>
          <svg width={size} height={size} viewBox={"-15 40 100 1"}>
            <ToolProfile toolName={props.toolName} reversed={false} x={0} y={0}
              width={ToolDimensions.diameter} height={ToolDimensions.thickness}
              sideView={"y" == slotPulloutAxis(pulloutDirection)}
              slotDirection={pulloutDirection} coordinate={false}
              toolFlipped={getToolDirection(
                pulloutDirection,
                isToolFlipped(props.toolSlot.body.meta),
                false)} />
          </svg>
          <p>{t("front")}</p>
        </div>}
    </div>;
};

export interface ToolSVGProps {
  toolName: string | undefined;
  profile?: boolean;
}

export const ToolSVG = (props: ToolSVGProps) => {
  const toolProps = {
    toolName: props.toolName,
    x: 0, y: 0, hovered: false, dispatch: noop, uuid: "", flipped: false,
    pulloutDirection: 0, toolTransformProps: { xySwap: false, quadrant: 2 },
  };
  const viewBox = "-40 0 80 1";
  return <div className={"tool-svg"}>
    <div className={"top"}>
      <svg width="3rem" height="3rem" viewBox={viewBox}>
        <Tool tool={reduceToolName(props.toolName)} toolProps={toolProps} />
      </svg>
      {props.profile && <p>{t("top")}</p>}
    </div>
    {props.profile &&
      <div className={"front"}>
        <svg width="3rem" height="3rem" viewBox={"-5 40 80 1"}>
          <ToolProfile toolName={props.toolName} reversed={false} x={0} y={0}
            width={ToolDimensions.diameter} height={ToolDimensions.thickness}
            sideView={false} slotDirection={ToolPulloutDirection.NONE}
            toolFlipped={false} coordinate={false} />
        </svg>
        <p>{t("front")}</p>
      </div>}
  </div>;
};
