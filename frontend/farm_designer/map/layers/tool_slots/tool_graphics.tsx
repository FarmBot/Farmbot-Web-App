import * as React from "react";
import { Color } from "../../../../ui/index";
import { trim } from "../../../../util";
import { BotOriginQuadrant } from "../../../interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { Actions } from "../../../../constants";
import { UUID } from "../../../../resources/interfaces";
import { TaggedToolSlotPointer } from "farmbot";
import { reduceToolName } from "./tool_slot_point";
import { noop } from "lodash";

export interface ToolGraphicProps {
  x: number;
  y: number;
  hovered: boolean;
  dispatch: Function;
  xySwap: boolean;
  uuid: UUID | undefined;
}

export interface ToolProps {
  tool: string;
  toolProps: ToolGraphicProps;
}

export interface ToolSlotGraphicProps {
  id: number | undefined;
  x: number;
  y: number;
  pulloutDirection: ToolPulloutDirection;
  quadrant: BotOriginQuadrant;
  xySwap: boolean;
  occupied: boolean;
}

const toolbaySlotAngle = (
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

export enum ToolNames {
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

export const ToolbaySlot = (props: ToolSlotGraphicProps) => {
  const { id, x, y, pulloutDirection, quadrant, xySwap } = props;
  const angle = toolbaySlotAngle(pulloutDirection, quadrant, xySwap);
  return <g id={"toolbay-slot"}>
    <defs>
      <g id={"toolbay-slot-" + id}
        fillOpacity={0.25}
        fill={Color.mediumGray}>
        <path d={trim(`M${x + 50} ${y + 50}
          h -150 v -100 h 150 v 15.5
          a 5 5 0 0 1 -2.5 2.5
          h -61.5
          a 35 35 0 0 0 0 64
          h 61.5
          a 5 5 0 0 1 2.5 2.5
          z`)} />
      </g>
    </defs>

    <use style={props.occupied ? { pointerEvents: "none" } : {}}
      xlinkHref={"#toolbay-slot-" + id}
      transform={
        `rotate(${angle}, ${x}, ${y})`} />
  </g>;
};

export const Tool = (props: ToolProps) => {
  switch (props.tool) {
    case ToolNames.weeder: return <Weeder {...props.toolProps} />;
    case ToolNames.wateringNozzle: return <WateringNozzle {...props.toolProps} />;
    case ToolNames.seeder: return <Seeder {...props.toolProps} />;
    case ToolNames.soilSensor: return <SoilSensor {...props.toolProps} />;
    case ToolNames.seedBin: return <SeedBin {...props.toolProps} />;
    case ToolNames.seedTray: return <SeedTray {...props.toolProps} />;
    case ToolNames.seedTrough: return <SeedTrough {...props.toolProps} />;
    case ToolNames.emptyToolSlot: return <EmptySlot {...props.toolProps} />;
    default: return <StandardTool {...props.toolProps} />;
  }
};

export const setToolHover = (payload: string | undefined) =>
  ({ type: Actions.HOVER_TOOL_SLOT, payload });

const StandardTool = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  return <g id={"tool"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>
    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
  </g>;
};

const EmptySlot = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  return <g id={"empty-tool-slot"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>
    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.2}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
    <circle
      cx={x}
      cy={y}
      r={34}
      fill={"none"}
      stroke={Color.mediumGray}
      opacity={0.5}
      strokeWidth={2}
      strokeDasharray={"10 5"} />
  </g>;
};

const Weeder = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  const size = 10;
  return <g id={"weeder"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>
    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
    <line
      x1={x - size} y1={y - size} x2={x + size} y2={y + size}
      stroke={Color.darkGray} opacity={0.8} strokeWidth={5} />
    <line
      x1={x - size} y1={y + size} x2={x + size} y2={y - size}
      stroke={Color.darkGray} opacity={0.8} strokeWidth={5} />
  </g>;
};

const WateringNozzle = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  return <g id={"watering-nozzle"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>

    <defs>
      <pattern id="WateringNozzlePattern"
        x={0} y={0} width={0.2} height={0.2}>
        <circle cx={5} cy={5} r={2} fill={Color.darkGray} fillOpacity={0.8} />
      </pattern>
    </defs>

    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
    <circle
      cx={x} cy={y} r={25}
      fill="url(#WateringNozzlePattern)" />
  </g>;
};

const Seeder = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  const size = 10;
  return <g id={"seeder"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>
    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
    <circle
      cx={x} cy={y} r={size}
      fillOpacity={0.8}
      fill={Color.darkGray} />
  </g>;
};

const SoilSensor = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  const size = 20;
  return <g id={"soil-sensor"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>
    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
    <line
      x1={x - size} y1={y} x2={x - size / 2} y2={y}
      stroke={Color.darkGray} opacity={0.8} strokeWidth={5} />
    <line
      x1={x + size} y1={y} x2={x + size / 2} y2={y}
      stroke={Color.darkGray} opacity={0.8} strokeWidth={5} />
  </g>;
};

const seedBinGradient =
  <radialGradient id="SeedBinGradient">
    <stop offset="5%" stopColor="rgb(0, 0, 0)" stopOpacity={0.3} />
    <stop offset="95%" stopColor="rgb(0, 0, 0)" stopOpacity={0.1} />
  </radialGradient>;

const SeedBin = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  return <g id={"seed-bin"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>

    <defs>
      {seedBinGradient}
    </defs>

    <circle
      cx={x} cy={y} r={35}
      fill="rgba(128, 128, 128, 0.8)" />
    <circle
      cx={x} cy={y} r={30}
      fill="url(#SeedBinGradient)" />
    {hovered &&
      <circle
        cx={x} cy={y} r={35}
        fill="rgba(0, 0, 0, 0.1)" />}

  </g>;
};

const SeedTray = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid } = props;
  return <g id={"seed-tray"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>

    <defs>
      {seedBinGradient}
      <pattern id="SeedTrayPattern"
        x={0} y={0} width={0.25} height={0.25}>
        <circle cx={6} cy={6} r={5} fill="url(#SeedBinGradient)" />
      </pattern>
    </defs>

    <circle
      cx={x} cy={y} r={35}
      fill="rgba(128, 128, 128, 0.8)" />
    <rect
      x={x - 25} y={y - 25}
      width={50} height={50}
      fill="url(#SeedTrayPattern)" />
    {hovered &&
      <circle
        cx={x} cy={y} r={35}
        fill="rgba(0, 0, 0, 0.1)" />}

  </g>;
};

export interface GantryToolSlotGraphicProps {
  x: number;
  y: number;
  xySwap: boolean;
}

/** dimensions */
enum Trough {
  width = 20,
  length = 45,
  wall = 4,
}

export const GantryToolSlot = (props: GantryToolSlotGraphicProps) => {
  const { x, y, xySwap } = props;
  const slotLengthX = Trough.wall + (xySwap ? Trough.width : Trough.length);
  const slotLengthY = Trough.wall + (xySwap ? Trough.length : Trough.width);
  return <g id={"gantry-toolbay-slot"}>
    <rect
      x={x - slotLengthX / 2} y={y - slotLengthY / 2}
      width={slotLengthX} height={slotLengthY}
      stroke={Color.mediumGray} strokeWidth={Trough.wall} strokeOpacity={0.25}
      fill="transparent" />
  </g>;
};

const SeedTrough = (props: ToolGraphicProps) => {
  const { x, y, hovered, dispatch, uuid, xySwap } = props;
  const slotLengthX = xySwap ? Trough.width : Trough.length;
  const slotLengthY = xySwap ? Trough.length : Trough.width;
  return <g id={"seed-trough"}
    onMouseOver={() => dispatch(setToolHover(uuid))}
    onMouseLeave={() => dispatch(setToolHover(undefined))}>
    <rect
      x={x - slotLengthX / 2} y={y - slotLengthY / 2}
      width={slotLengthX} height={slotLengthY}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
  </g>;
};

export interface ToolSlotSVGProps {
  toolSlot: TaggedToolSlotPointer;
  toolName: string | undefined;
  renderRotation: boolean;
  xySwap?: boolean;
  quadrant?: BotOriginQuadrant;
}

export const ToolSlotSVG = (props: ToolSlotSVGProps) => {
  const xySwap = props.renderRotation ? !!props.xySwap : false;
  const toolProps = {
    x: 0, y: 0,
    hovered: false,
    dispatch: noop,
    uuid: props.toolSlot.uuid,
    xySwap,
  };
  const pulloutDirection = props.renderRotation
    ? props.toolSlot.body.pullout_direction
    : ToolPulloutDirection.POSITIVE_X;
  const quadrant = props.renderRotation && props.quadrant ? props.quadrant : 2;
  const viewBox = props.renderRotation ? "-25 0 50 1" : "-25 0 50 1";
  return props.toolSlot.body.gantry_mounted
    ? <svg width="3rem" height="3rem" viewBox={viewBox}>
      <GantryToolSlot x={0} y={0} xySwap={xySwap} />
      {props.toolSlot.body.tool_id &&
        <Tool tool={reduceToolName(props.toolName)} toolProps={toolProps} />}
    </svg>
    : <svg width="3rem" height="3rem" viewBox={`-50 0 100 1`}>
      {props.toolSlot.body.pullout_direction &&
        <ToolbaySlot
          id={props.toolSlot.body.id}
          x={0}
          y={0}
          pulloutDirection={pulloutDirection}
          quadrant={quadrant}
          occupied={false}
          xySwap={xySwap} />}
      {(props.toolSlot.body.tool_id ||
        !props.toolSlot.body.pullout_direction) &&
        <Tool tool={reduceToolName(props.toolName)} toolProps={toolProps} />}
    </svg>;
};

export interface ToolSVGProps {
  toolName: string | undefined;
}

export const ToolSVG = (props: ToolSVGProps) => {
  const toolProps = {
    x: 0, y: 0, hovered: false, dispatch: noop, uuid: "", xySwap: false,
  };
  const viewBox = reduceToolName(props.toolName) === ToolNames.seedTrough
    ? "-25 0 50 1" : "-40 0 80 1";
  return <svg width="3rem" height="3rem" viewBox={viewBox}>
    <Tool tool={reduceToolName(props.toolName)} toolProps={toolProps} />}
</svg>;
};
