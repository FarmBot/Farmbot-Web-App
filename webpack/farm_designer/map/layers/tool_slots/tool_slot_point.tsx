import * as React from "react";
import { SlotWithTool } from "../../../../resources/interfaces";
import { transformXY } from "../../util";
import { MapTransformProps } from "../../interfaces";
import * as _ from "lodash";
import { ToolbaySlot, ToolNames, Tool } from "./tool_graphics";
import { ToolLabel } from "./tool_label";

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
    const { mapTransformProps } = this.props;
    const { quadrant, xySwap } = mapTransformProps;
    const { qx, qy } = transformXY(x, y, this.props.mapTransformProps);
    const toolName = this.slot.tool ? this.slot.tool.body.name : "no tool";
    const toolProps = {
      x: qx,
      y: qy,
      hovered: this.state.hovered,
      setHoverState: this.setHover
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

      {(this.slot.tool || !pullout_direction) &&
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
