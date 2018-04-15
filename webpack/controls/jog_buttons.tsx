import * as React from "react";
import { DirectionButton } from "./direction_button";
import { homeAll } from "../devices/actions";
import { JogMovementControlsProps } from "./interfaces";
import { getDevice } from "../device";
import { buildDirectionProps } from "./direction_axes_props";

const DEFAULT_STEP_SIZE = 100;

export function JogButtons(props: JogMovementControlsProps) {
  const { stepSize, xySwap, arduinoBusy } = props;
  const directionAxesProps = buildDirectionProps(props);
  const rightLeft = xySwap ? "y" : "x";
  const upDown = xySwap ? "x" : "y";

  return <table className="jog-table">
    <tbody>
      <tr>
        <td>
          <button
            className="i fa fa-camera arrow-button fb-button"
            onClick={() => getDevice().takePhoto().catch(() => { })} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton
            axis="z"
            direction="up"
            directionAxisProps={directionAxesProps.z}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
      </tr>
      <tr>
        <td>
          <button
            className="i fa fa-home arrow-button fb-button"
            onClick={() => homeAll(100)}
            disabled={arduinoBusy || false} />
        </td>
        <td />
        <td>
          <DirectionButton
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td>
          <DirectionButton
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td>
          <DirectionButton
            axis={rightLeft}
            direction="right"
            directionAxisProps={directionAxesProps[rightLeft]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td />
        <td>
          <DirectionButton
            axis="z"
            direction="down"
            directionAxisProps={directionAxesProps.z}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
      </tr>
      <tr>
        <td />
      </tr>
    </tbody>
  </table>;
}
