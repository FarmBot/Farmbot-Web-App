import * as React from "react";
import { getXYFromQuadrant } from "./util";
import { BotOriginQuadrant } from "../interfaces";
import { McuParams } from "farmbot/dist";
import { StepsPerMmXY } from "../../devices/interfaces";

export interface BotExtentsProps {
  quadrant: BotOriginQuadrant;
  botMcuParams: McuParams;
  stepsPerMmXY: StepsPerMmXY;
}

interface BotExtentsState {
}

export class BotExtents extends
  React.Component<BotExtentsProps, Partial<BotExtentsState>> {

  render() {
    const { quadrant, botMcuParams, stepsPerMmXY } = this.props;
    const stopAtHomeX = !!botMcuParams.movement_stop_at_home_x;
    const stopAtHomeY = !!botMcuParams.movement_stop_at_home_y;
    const stopAtMaxX = !!botMcuParams.movement_stop_at_max_x;
    const stopAtMaxY = !!botMcuParams.movement_stop_at_max_y;
    const axisLengthX = botMcuParams.movement_axis_nr_steps_x || 0;
    const axisLengthY = botMcuParams.movement_axis_nr_steps_y || 0;

    const useMaxLines =
      (axisLength: number, stopAtMax: boolean): boolean => axisLength !== 0 && stopAtMax;

    const homeLengthX = stepsPerMmXY.x &&
      useMaxLines(axisLengthX, stopAtMaxX) ? axisLengthX / stepsPerMmXY.x : 3000;
    const homeLengthY = stepsPerMmXY.y &&
      useMaxLines(axisLengthY, stopAtMaxY) ? axisLengthY / stepsPerMmXY.y : 1500;
    const homeLength = getXYFromQuadrant(homeLengthX, homeLengthY, quadrant);
    const homeZero = getXYFromQuadrant(2, 2, quadrant);

    return <g id="extents"
      strokeWidth="4" strokeLinecap="square" stroke="rgba(0, 0, 0, 0.2)" strokeDasharray="12">
      <g id="home-lines">
        {stopAtHomeX &&
          <line x1={homeZero.qx} y1={homeZero.qy} x2={homeZero.qx} y2={homeLength.qy} />
        }
        {stopAtHomeY &&
          <line x1={homeZero.qx} y1={homeZero.qy} x2={homeLength.qx} y2={homeZero.qy} />
        }
      </g>
      <g id="max-lines">
        {useMaxLines(axisLengthX, stopAtMaxX) &&
          <line x1={homeLength.qx} y1={homeZero.qy} x2={homeLength.qx} y2={homeLength.qy} />
        }
        {useMaxLines(axisLengthY, stopAtMaxY) &&
          <line x1={homeZero.qx} y1={homeLength.qy} x2={homeLength.qx} y2={homeLength.qy} />
        }
      </g>
    </g>;
  }
}
