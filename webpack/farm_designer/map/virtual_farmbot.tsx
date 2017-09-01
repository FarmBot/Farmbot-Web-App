import * as React from "react";
import { getXYFromQuadrant } from "./util";
import { BotOriginQuadrant } from "../interfaces";
import { BotPosition } from "../../devices/interfaces";

export interface VFBProps {
  quadrant: BotOriginQuadrant;
  botPosition: BotPosition;
}

interface VFBState {
}

export class VirtualFarmBot extends
  React.Component<VFBProps, Partial<VFBState>> {

  render() {
    const { x, y } = this.props.botPosition;
    const { quadrant } = this.props;
    const { qx, qy } = getXYFromQuadrant((x || 0), (y || 0), quadrant);
    return <g>
      <rect
        x={qx - 10}
        y={0}
        width={20}
        height={1500}
        fillOpacity={0.75}
        fill={"#434343"} />
      <circle
        cx={qx}
        cy={qy}
        r={35}
        fillOpacity={0.75}
        fill={"#434343"} />
    </g>;
  }
}
