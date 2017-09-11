import * as React from "react";
import { SlotWithTool } from "../../resources/interfaces";
import { getXYFromQuadrant } from "./util";
import { MapTransformProps } from "./interfaces";
import * as _ from "lodash";

interface TSPProps {
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

  get slot() { return this.props.slot; }

  render() {
    const { x, y } = this.slot.toolSlot.body;
    const { quadrant, gridSize } = this.props.mapTransformProps;
    const { qx, qy } = getXYFromQuadrant(x, y, quadrant, gridSize);
    const toolName = this.slot.tool ? this.slot.tool.body.name : "no tool";
    const seedBin = _.includes(toolName.toLowerCase(), "seed bin");
    const seedTray = _.includes(toolName.toLowerCase(), "seed tray");
    const seedTrayRect = getXYFromQuadrant(x, y, quadrant, gridSize);
    return <g>
      <defs>
        <radialGradient id="SeedBinGradient">
          <stop offset="5%" stopColor="rgba(0, 0, 0, 0.3)" />
          <stop offset="95%" stopColor="rgba(0, 0, 0, 0.1)" />
        </radialGradient>
        <pattern id="SeedTrayPattern"
          x={0} y={0} width={0.25} height={0.25}>
          <circle cx={6} cy={6} r={5} fill="url(#SeedBinGradient)" />
        </pattern>
      </defs>

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
          fill={this.state.hovered ? "#434343" : "#666666"} />
      }
      <text
        visibility={this.state.hovered ? "visible" : "hidden"}
        x={qx}
        y={qy}
        dx={40}
        dy={10}
        fontSize={24}
        fill={"#434343"}>
        {toolName}
      </text>
    </g>;
  }
}
