import * as React from "react";
import { SlotWithTool } from "../../resources/interfaces";
import { getXYFromQuadrant } from "./util";
import { MapTransformProps } from "./interfaces";
import * as _ from "lodash";
import { Color } from "../../ui/index";
import { ToolPulloutDirection } from "../../interfaces";
import { ToolbaySlot, ToolNames, Tool } from "./tool_graphics";

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

  setHover = (state: boolean) => { this.setState({ hovered: state }); };

  get slot() { return this.props.slot; }

  reduceToolName = (raw: string | undefined) => {
    const lower = (raw || "").toLowerCase();
    if (_.includes(lower, "seed bin")) { return ToolNames.seedBin; }
    if (_.includes(lower, "seed tray")) { return ToolNames.seedTray; }
    return ToolNames.tool;
  }

  render() {
    const { id, x, y, pullout_direction } = this.slot.toolSlot.body;
    const { quadrant, gridSize } = this.props.mapTransformProps;
    const { qx, qy } = getXYFromQuadrant(x, y, quadrant, gridSize);
    const toolName = this.slot.tool ? this.slot.tool.body.name : "no tool";
    const toolProps = {
      x: qx,
      y: qy,
      hovered: this.state.hovered,
      setHoverState: this.setHover
    };
    const labelAnchor = pullout_direction === ToolPulloutDirection.NEGATIVE_X
      ? "end"
      : "start";
    return <g id={"toolslot-" + id}>
      {pullout_direction &&
        <ToolbaySlot
          id={id}
          x={qx}
          y={qy}
          pulloutDirection={pullout_direction}
          quadrant={quadrant} />}

      {(this.slot.tool || !pullout_direction) &&
        <Tool
          tool={this.reduceToolName(toolName)}
          toolProps={toolProps} />}

      <text textAnchor={labelAnchor}
        visibility={this.state.hovered ? "visible" : "hidden"}
        x={qx}
        y={qy}
        dx={labelAnchor === "start" ? 40 : -40}
        dy={10}
        fontSize={24}
        fill={Color.darkGray}>
        {toolName}
      </text>
    </g>;
  }
}
