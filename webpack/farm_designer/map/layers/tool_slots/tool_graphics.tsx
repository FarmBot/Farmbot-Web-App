import * as React from "react";
import { Color } from "../../../../ui/index";
import { trim } from "../../../../util";
import { BotOriginQuadrant } from "../../../interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";

export interface ToolGraphicProps {
  x: number;
  y: number;
  hovered: boolean;
  setHoverState(hoverState: boolean): void;
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
  seedBin = "seedBin",
  seedTray = "seedTray",
  tool = "tool",
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

    <use style={{ pointerEvents: "none" }}
      xlinkHref={"#toolbay-slot-" + id}
      transform={
        `rotate(${angle}, ${x}, ${y})`} />
  </g>;
};

export const Tool = (props: ToolProps) => {
  switch (props.tool) {
    case ToolNames.seedBin: return <SeedBin {...props.toolProps} />;
    case ToolNames.seedTray: return <SeedTray {...props.toolProps} />;
    default: return <StandardTool {...props.toolProps} />;
  }
};

const StandardTool = (props: ToolGraphicProps) => {
  const { x, y, hovered, setHoverState } = props;
  return <g id={"tool"}
    onMouseOver={() => setHoverState(true)}
    onMouseLeave={() => setHoverState(false)}>
    <circle
      cx={x}
      cy={y}
      r={35}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
  </g>;
};

const seedBinGradient =
  <radialGradient id="SeedBinGradient">
    <stop offset="5%" stopColor="rgb(0, 0, 0)" stopOpacity={0.3} />
    <stop offset="95%" stopColor="rgb(0, 0, 0)" stopOpacity={0.1} />
  </radialGradient>;

const SeedBin = (props: ToolGraphicProps) => {
  const { x, y, hovered, setHoverState } = props;
  return <g id={"seed-bin"}
    onMouseOver={() => setHoverState(true)}
    onMouseLeave={() => setHoverState(false)}>

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
  const { x, y, hovered, setHoverState } = props;
  return <g id={"seed-tray"}
    onMouseOver={() => setHoverState(true)}
    onMouseLeave={() => setHoverState(false)}>

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
