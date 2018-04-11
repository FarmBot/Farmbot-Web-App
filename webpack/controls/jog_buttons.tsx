import * as React from "react";
import { DirectionButton } from "./direction_button";
import { homeAll } from "../devices/actions";
import { JogMovementControlsProps } from "./interfaces";
import { getDevice } from "../device";
import { buildDirectionProps } from "./direction_axes_props";

export function JogButtons(props: JogMovementControlsProps) {
  const directionAxesProps = buildDirectionProps(props);
  return <table className="jog-table" style={{ border: 0 }}>
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
            axis="y"
            direction="up"
            directionAxisProps={directionAxesProps.y}
            steps={props.bot.stepSize || 1000}
            disabled={props.disabled} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton
            axis="z"
            direction="up"
            directionAxisProps={directionAxesProps.z}
            steps={props.bot.stepSize || 1000}
            disabled={props.disabled} />
        </td>
      </tr>
      <tr>
        <td>
          <button
            className="i fa fa-home arrow-button fb-button"
            onClick={() => homeAll(100)}
            disabled={props.disabled || false} />
        </td>
        <td />
        <td>
          <DirectionButton
            axis="x"
            direction="left"
            directionAxisProps={directionAxesProps.x}
            steps={props.bot.stepSize || 1000}
            disabled={props.disabled} />
        </td>
        <td>
          <DirectionButton
            axis="y"
            direction="down"
            directionAxisProps={directionAxesProps.y}
            steps={props.bot.stepSize || 1000}
            disabled={props.disabled} />
        </td>
        <td>
          <DirectionButton
            axis="x"
            direction="right"
            directionAxisProps={directionAxesProps.x}
            steps={props.bot.stepSize || 1000}
            disabled={props.disabled} />
        </td>
        <td />
        <td>
          <DirectionButton
            axis="z"
            direction="down"
            directionAxisProps={directionAxesProps.z}
            steps={props.bot.stepSize || 1000}
            disabled={props.disabled} />
        </td>
      </tr>
      <tr>
        <td />
      </tr>
    </tbody>
  </table>;
}
