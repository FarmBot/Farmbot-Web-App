import * as React from "react";
import { SlotWithTool } from "../../resources/interfaces";
import { getXYFromQuadrant } from "./util";
import { MapTransformProps } from "./interfaces";
import * as _ from "lodash";
import { Color } from "../../ui/index";
import { trim } from "../../util";
import { ToolPulloutDirection } from "../../interfaces";

export interface TSPProps {
  slot: SlotWithTool;
  mapTransformProps: MapTransformProps;
}

interface TSPState {
  hovered: boolean;
}

export class ToolSlotPoint extends
  React.Component<TSPProps, Partial<TSPState>> {

  state: TSPState = {
    hovered: false
  };

  angles = [0, 0, 180, 270, 90];

  get slot() { return this.props.slot; }

  render() {
    const { id, x, y, pullout_direction } = this.slot.toolSlot.body;
    const { quadrant, gridSize } = this.props.mapTransformProps;
    const { qx, qy } = getXYFromQuadrant(x, y, quadrant, gridSize);
    const toolName = this.slot.tool ? this.slot.tool.body.name : "no tool";
    const seedBin = _.includes((toolName || "").toLowerCase(), "seed bin");
    const seedTray = _.includes((toolName || "").toLowerCase(), "seed tray");
    const seedTrayRect = getXYFromQuadrant(x, y, quadrant, gridSize);
    const labelAnchor = pullout_direction === ToolPulloutDirection.NEGATIVE_X
      ? "end"
      : "start";
    return <g id={"toolslot-" + id}>
      <defs>
        <radialGradient id="SeedBinGradient">
          <stop offset="5%" stopColor="rgb(0, 0, 0)" stopOpacity={0.3} />
          <stop offset="95%" stopColor="rgb(0, 0, 0)" stopOpacity={0.1} />
        </radialGradient>
        <pattern id="SeedTrayPattern"
          x={0} y={0} width={0.25} height={0.25}>
          <circle cx={6} cy={6} r={5} fill="url(#SeedBinGradient)" />
        </pattern>
        <g id={"toolbay-slot-" + id}
          fillOpacity={0.25}
          fill={Color.mediumGray}>
          <path d={trim(`M${qx + 50} ${qy + 50}
          h -150 v -100 h 150 v 15.5
          a 5 5 0 0 1 -2.5 2.5
          h -61.5
          a 35 35 0 0 0 0 64
          h 61.5
          a 5 5 0 0 1 2.5 2.5
          z`)} />
        </g>
      </defs>

      {pullout_direction &&
        <use style={{ pointerEvents: "none" }}
          xlinkHref={"#toolbay-slot-" + id}
          transform={
            `rotate(${this.angles[pullout_direction]}, ${qx}, ${qy})`} />}

      {seedBin &&
        <g id="seed-bin" key={this.slot.toolSlot.uuid}
          onMouseOver={() => this.setState({ hovered: true })}
          onMouseLeave={() => this.setState({ hovered: false })}>
          <circle
            cx={qx} cy={qy} r={35}
            fill="rgba(128, 128, 128, 0.8)" />
          <circle
            cx={qx} cy={qy} r={30}
            fill="url(#SeedBinGradient)" />
          {this.state.hovered &&
            <circle
              cx={qx} cy={qy} r={35}
              fill="rgba(0, 0, 0, 0.1)" />}
        </g>
      }
      {seedTray &&
        <g id="seed-tray" key={this.slot.toolSlot.uuid}
          onMouseOver={() => this.setState({ hovered: true })}
          onMouseLeave={() => this.setState({ hovered: false })}>
          <circle
            cx={qx} cy={qy} r={35}
            fill="rgba(128, 128, 128, 0.8)" />
          <rect
            x={seedTrayRect.qx - 25} y={seedTrayRect.qy - 25}
            width={50} height={50}
            fill="url(#SeedTrayPattern)" />
          {this.state.hovered &&
            <circle
              cx={qx} cy={qy} r={35}
              fill="rgba(0, 0, 0, 0.1)" />}
        </g>
      }
      {!seedBin && !seedTray &&
        <circle key={this.slot.toolSlot.uuid}
          onMouseOver={() => this.setState({ hovered: true })}
          onMouseLeave={() => this.setState({ hovered: false })}
          cx={qx}
          cy={qy}
          r={35}
          fillOpacity={0.5}
          fill={this.state.hovered ? Color.darkGray : Color.mediumGray} />
      }

      <text textAnchor={labelAnchor}
        visibility={this.state.hovered ? "visible" : "hidden"}
        x={qx}
        y={qy}
        dx={40}
        dy={10}
        fontSize={24}
        fill={Color.darkGray}>
        {toolName}
      </text>
    </g>;
  }
}
