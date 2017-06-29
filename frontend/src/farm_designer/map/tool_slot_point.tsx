import * as React from "react";
import { SlotWithTool } from "../../resources/interfaces";
import { getXYFromQuadrant } from "./util";
import { BotOriginQuadrant } from "../interfaces";

interface TSPProps {
  slot: SlotWithTool;
  quadrant: BotOriginQuadrant;
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
    let { x, y } = this.slot.toolSlot.body;
    let { quadrant } = this.props;
    let { qx, qy } = getXYFromQuadrant(x, y, quadrant);
    return <g>
      <circle key={this.slot.toolSlot.uuid}
        onMouseOver={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
        cx={qx}
        cy={qy}
        r={35}
        fillOpacity={0.5}
        fill={this.state.hovered ? "#434343" : "#666666"} />
      <text
        hidden={!this.state.hovered}
        x={qx}
        y={qy}
        dx={40}
        dy={10}
        fontSize={24}
        fill={"#434343"}>
        {this.slot.tool ? this.slot.tool.body.name : "no tool"}
      </text>
    </g>
  }
}
