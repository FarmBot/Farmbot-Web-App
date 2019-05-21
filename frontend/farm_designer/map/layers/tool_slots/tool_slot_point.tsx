import * as React from "react";
import { SlotWithTool } from "../../../../resources/interfaces";
import { transformXY } from "../../util";
import { MapTransformProps } from "../../interfaces";
import { ToolbaySlot, ToolNames, Tool, GantryToolSlot } from "./tool_graphics";
import { ToolLabel } from "./tool_label";
import { includes } from "lodash";

export interface TSPProps {
  slot: SlotWithTool;
  botPositionX: number | undefined;
  mapTransformProps: MapTransformProps;
}

interface TSPState {
  hovered: boolean;
}

export class ToolSlotPoint extends
  React.Component<TSPProps, Partial<TSPState>> {
  state: TSPState = { hovered: false };

  setHover = (state: boolean) => this.setState({ hovered: state });

  get slot() { return this.props.slot; }

  reduceToolName = (raw: string | undefined) => {
    const lower = (raw || "").toLowerCase();
    if (includes(lower, "seed bin")) { return ToolNames.seedBin; }
    if (includes(lower, "seed tray")) { return ToolNames.seedTray; }
    if (includes(lower, "seed trough")) { return ToolNames.seedTrough; }
    return ToolNames.tool;
  }

  render() {
    const {
      id, x, y, pullout_direction, gantry_mounted
    } = this.slot.toolSlot.body;
    const { mapTransformProps, botPositionX } = this.props;
    const { quadrant, xySwap } = mapTransformProps;
    const xPosition = gantry_mounted ? (botPositionX || 0) : x;
    const { qx, qy } = transformXY(xPosition, y, this.props.mapTransformProps);
    const toolName = this.slot.tool ? this.slot.tool.body.name : "no tool";
    const toolProps = {
      x: qx,
      y: qy,
      hovered: this.state.hovered,
      setHoverState: this.setHover,
      xySwap,
    };
    return <g id={"toolslot-" + id}>
      {pullout_direction &&
        <ToolbaySlot
          id={id}
          x={qx}
          y={qy}
          pulloutDirection={pullout_direction}
          quadrant={quadrant}
          xySwap={xySwap} />}

      {gantry_mounted && <GantryToolSlot x={qx} y={qy} xySwap={xySwap} />}

      {(this.slot.tool || (!pullout_direction && !gantry_mounted)) &&
        <Tool
          tool={this.reduceToolName(toolName)}
          toolProps={toolProps} />}

      <ToolLabel
        toolName={toolName}
        hovered={this.state.hovered}
        x={qx}
        y={qy}
        pulloutDirection={pullout_direction}
        quadrant={quadrant}
        xySwap={xySwap} />
    </g>;
  }
}
