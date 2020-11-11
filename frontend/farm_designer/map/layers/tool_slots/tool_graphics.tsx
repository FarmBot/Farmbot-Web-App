import React from "react";
import { Color } from "../../../../ui/index";
import { trim } from "../../../../util";
import { BotOriginQuadrant } from "../../../interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { Actions } from "../../../../constants";
import { UUID } from "../../../../resources/interfaces";
import { TaggedToolSlotPointer } from "farmbot";
import { reduceToolName } from "./tool_slot_point";
import { noop } from "lodash";
import { ToolTransformProps } from "../../../../tools/interfaces";
import { isToolFlipped } from "../../../../tools/tool_slot_edit_components";

export interface ToolGraphicProps {
  x: number;
  y: number;
  hovered: boolean;
  dispatch: Function;
  pulloutDirection: ToolPulloutDirection;
  flipped: boolean;
  toolTransformProps: ToolTransformProps;
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
    <defs id="unrotated-tool-slot-source">
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

const Tool = (props: ToolProps) => {
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
  const { x, y, hovered } = props;
  return <g id={"tool"}>
    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
  </g>;
};

const EmptySlot = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"empty-tool-slot"}>
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

enum ToolColor {
  weeder = "rgba(238, 102, 102)",
  wateringNozzle = "rgba(40, 120, 220)",
  seeder = "rgba(240, 200, 0)",
  soilSensor = "rgba(128, 128, 128)",
  soilSensorPCB = "rgba(255, 215, 0)",
  seedBin = "rgba(128, 128, 128)",
  seedTray = "rgba(128, 128, 128)",
  none = "rgba(102, 102, 102)",
}

const TOOL_COLOR_LOOKUP: Record<ToolNames, ToolColor> = {
  [ToolNames.weeder]: ToolColor.weeder,
  [ToolNames.wateringNozzle]: ToolColor.wateringNozzle,
  [ToolNames.seeder]: ToolColor.seeder,
  [ToolNames.soilSensor]: ToolColor.soilSensor,
  [ToolNames.seedBin]: ToolColor.seedBin,
  [ToolNames.seedTray]: ToolColor.seedTray,
  [ToolNames.seedTrough]: ToolColor.seedTray,
  [ToolNames.emptyToolSlot]: ToolColor.none,
  [ToolNames.tool]: ToolColor.none,
};

export const getToolColor = (toolName: string | undefined) =>
  TOOL_COLOR_LOOKUP[reduceToolName(toolName)];

const Weeder = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  const width = 16;
  const height = 8;
  return <g id={"weeder"}>
    <defs id="weeder-gradients">
      <radialGradient id="WeederGradient">
        <stop offset="5%" stopColor={Color.black} stopOpacity={0.4} />
        <stop offset="95%" stopColor={Color.black} stopOpacity={0.2} />
      </radialGradient>
      <linearGradient id="WeederImplementGradient"
        x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={Color.black} stopOpacity={0.5} />
        <stop offset="50%" stopColor={Color.black} stopOpacity={0.1} />
        <stop offset="100%" stopColor={Color.black} stopOpacity={0.5} />
      </linearGradient>
    </defs>

    <circle cx={x} cy={y} r={35}
      fill={ToolColor.weeder} fillOpacity={0.8} />
    <circle cx={x} cy={y} r={30}
      fill="url(#WeederGradient)" />

    <rect x={x - width / 2} y={y - height / 2} width={width} height={height}
      fill="url(#WeederImplementGradient)" />

    {hovered &&
      <circle cx={x} cy={y} r={35}
        fill={Color.black} fillOpacity={0.1} />}
  </g>;
};

const WateringNozzle = (props: ToolGraphicProps) => {
  const { x, y, hovered, uuid } = props;
  const r = 2;
  const ySpacing = 10;
  const xSpacing = 14;
  return <g id={"watering-nozzle"}>

    <defs id="watering-nozzle-patterns">
      <pattern id={`WateringNozzlePattern1-${uuid}`} patternUnits="userSpaceOnUse"
        x={x - r} y={y - r} width={xSpacing} height={ySpacing}>
        <circle cx={r} cy={r} r={r} fill={Color.black} fillOpacity={0.4} />
      </pattern>
      <pattern id={`WateringNozzlePattern2-${uuid}`} patternUnits="userSpaceOnUse"
        x={x - (xSpacing / 2 + r)} y={y - (ySpacing / 2 + r)}
        width={xSpacing} height={ySpacing}>
        <circle cx={r} cy={r} r={r} fill={Color.black} fillOpacity={0.4} />
      </pattern>
      <pattern id={`WateringNozzlePattern3-${uuid}`} patternUnits="userSpaceOnUse"
        x={x} y={y} width={3 * xSpacing} height={ySpacing}>
        <circle cx={1.5 * xSpacing} cy={ySpacing / 2} r={r}
          fill={Color.black} fillOpacity={0.4} />
      </pattern>
    </defs>

    <circle cx={x} cy={y} r={35} fill={ToolColor.wateringNozzle}
      fillOpacity={0.8} />
    <circle cx={x} cy={y} r={30} fill={Color.black}
      fillOpacity={0.2} />

    <rect
      x={x - (xSpacing + r)} y={y - (2 * ySpacing + r)}
      width={2 * (xSpacing + r)} height={2 * (2 * ySpacing + r)}
      fill={`url(#WateringNozzlePattern1-${uuid})`} />
    <rect
      x={x - (xSpacing / 2 + r)} y={y - (1.5 * ySpacing + r)}
      width={2 * (xSpacing / 2 + r)} height={2 * (1.5 * ySpacing + r)}
      fill={`url(#WateringNozzlePattern2-${uuid})`} />
    <rect
      x={x - (1.5 * xSpacing + r)} y={y - (ySpacing / 2 + r)}
      width={2 * (1.5 * xSpacing + r)} height={2 * (ySpacing / 2 + r)}
      fill={`url(#WateringNozzlePattern3-${uuid})`} />

    {hovered &&
      <circle cx={x} cy={y} r={35}
        fill={Color.black} fillOpacity={0.1} />}

  </g>;
};

const Seeder = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  const offset = 12.5;
  return <g id={"seeder"}>
    <defs id="seeder-gradient">
      <radialGradient id="SeederGradient">
        <stop offset="5%" stopColor={Color.black} stopOpacity={0.25} />
        <stop offset="95%" stopColor={Color.black} stopOpacity={0.15} />
      </radialGradient>
    </defs>

    <circle cx={x} cy={y} r={35} fill={ToolColor.seeder}
      fillOpacity={0.7} />
    <circle cx={x} cy={y} r={30} fill="url(#SeederGradient)" />
    <circle cx={x} cy={y + offset} r={7} fill={Color.black} fillOpacity={0.25} />
    <circle cx={x} cy={y + offset} r={2} fill={Color.black} fillOpacity={0.3} />

    {hovered &&
      <circle cx={x} cy={y} r={35}
        fill={Color.black} fillOpacity={0.1} />}
  </g>;
};

const SoilSensor = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  const width = 24;
  const pcbWidth = width / 3;
  const height = 4;
  const pcbHeight = height / 4;
  const offset = 2;
  return <g id={"soil-sensor"}>
    <defs id="soil-sensor-gradient-and-pattern">
      <radialGradient id="SoilSensorGradient">
        <stop offset="5%" stopColor={Color.black} stopOpacity={0.4} />
        <stop offset="95%" stopColor={Color.black} stopOpacity={0.2} />
      </radialGradient>
      <pattern id="SoilSensorPattern"
        x={0} y={offset} width={1 / 1.5} height={1}>
        <rect x={0} y={0}
          width={pcbWidth} height={pcbHeight}
          fill={ToolColor.soilSensorPCB} fillOpacity={0.9} />
        <rect x={0} y={pcbHeight}
          width={pcbWidth} height={2 * pcbHeight}
          fill={Color.black} fillOpacity={0.8} />
        <rect x={0} y={3 * pcbHeight}
          width={pcbWidth} height={pcbHeight}
          fill={ToolColor.soilSensorPCB} fillOpacity={0.9} />
      </pattern>
    </defs>

    <circle cx={x} cy={y} r={35}
      fill={ToolColor.soilSensor} fillOpacity={0.8} />
    <circle cx={x} cy={y} r={30}
      fill={"url(#SoilSensorGradient)"} />

    <rect x={x - width / 2} y={y - height / 2 + offset}
      width={width} height={height}
      fill={Color.black} fillOpacity={0.4} />

    <rect x={x - width / 2} y={y - height / 2 + offset}
      width={width} height={height}
      fill="url(#SoilSensorPattern)" />

    {hovered &&
      <circle cx={x} cy={y} r={35}
        fill={Color.black} fillOpacity={0.1} />}
  </g>;
};

const seedBinGradient =
  <radialGradient id="SeedBinGradient">
    <stop offset="5%" stopColor={Color.black} stopOpacity={0.3} />
    <stop offset="95%" stopColor={Color.black} stopOpacity={0.1} />
  </radialGradient>;

const SeedBin = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"seed-bin"}>

    <defs id="seed-bin-gradient">
      {seedBinGradient}
    </defs>

    <circle
      cx={x} cy={y} r={35}
      fill={ToolColor.seedBin} fillOpacity={0.8} />
    <circle
      cx={x} cy={y} r={30}
      fill="url(#SeedBinGradient)" />
    {hovered &&
      <circle cx={x} cy={y} r={35}
        fill={Color.black} fillOpacity={0.1} />}

  </g>;
};

const SeedTray = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"seed-tray"}>

    <defs id="seed-tray-gradient-and-pattern">
      {seedBinGradient}
      <pattern id="SeedTrayPattern"
        x={0} y={0} width={0.25} height={0.25}>
        <circle cx={6} cy={6} r={5} fill="url(#SeedBinGradient)" />
      </pattern>
    </defs>

    <circle
      cx={x} cy={y} r={35}
      fill={ToolColor.seedTray} fillOpacity={0.8} />
    <rect
      x={x - 25} y={y - 25}
      width={50} height={50}
      fill="url(#SeedTrayPattern)" />
    {hovered &&
      <circle cx={x} cy={y} r={35}
        fill={Color.black} fillOpacity={0.1} />}

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
  const { x, y, hovered } = props;
  return <g id={"seed-trough"}>
    <rect
      x={x - Trough.width / 2} y={y - Trough.length / 2}
      width={Trough.width} height={Trough.length}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
  </g>;
};

export interface ThreeInOneToolHeadProps {
  x: number;
  y: number;
  color: string;
  toolTransformProps: ToolTransformProps;
  pulloutDirection: ToolPulloutDirection;
}

export const ThreeInOneToolHead = (props: ThreeInOneToolHeadProps) => {
  const { pulloutDirection } = props;
  const { quadrant, xySwap } = props.toolTransformProps;
  const angle = toolbaySlotAngle(pulloutDirection, quadrant, xySwap);
  return <g id="three-in-one-tool-head">
    <defs id="tool-head-defs">
      <g id="unrotated-tool-head">
        <circle
          cx={props.x}
          cy={props.y}
          r={25}
          fillOpacity={0.5}
          fill={props.color} />
        <circle
          cx={props.x}
          cy={props.y + 10}
          r={8}
          fill={props.color}
          fillOpacity={0.25} />
        <circle
          cx={props.x}
          cy={props.y - 10}
          r={5}
          fill={props.color}
          fillOpacity={0.25} />
        <circle
          cx={props.x}
          cy={props.y - 10}
          r={2}
          fill={props.color}
          fillOpacity={0.3} />
      </g>
    </defs>

    <use xlinkHref={"#unrotated-tool-head"}
      transform={`rotate(${angle - 90}, ${props.x}, ${props.y})`} />
  </g>;
};

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
  const viewBox = reduceToolName(props.toolName) === ToolNames.seedTrough
    ? "-25 0 50 1"
    : "-40 0 80 1";
  return <svg width="3rem" height="3rem" viewBox={viewBox}>
    <Tool tool={reduceToolName(props.toolName)} toolProps={toolProps} />
  </svg>;
};
