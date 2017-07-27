import * as React from "react";
import { Props } from "../interfaces";
import { getXYFromQuadrant } from "./util";
import { BotOriginQuadrant } from "../interfaces";
import { BotState } from "../../devices/interfaces";

interface VFBProps {
  quadrant: BotOriginQuadrant;
  bot: BotState;
}

interface VFBState {
}

export class VirtualFarmBot extends
  React.Component<VFBProps, Partial<VFBState>> {

  render() {
    let { x, y, z } = this.props.bot.hardware.location_data.position;
    let { quadrant } = this.props;
    let { qx, qy } = getXYFromQuadrant((x || 0), (y || 0), quadrant);
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
