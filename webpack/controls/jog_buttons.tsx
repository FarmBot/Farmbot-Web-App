import * as React from "react";
import { DirectionButton } from "./direction_button";
import { homeAll } from "../devices/actions";
import { JogMovementControlsProps } from "./interfaces";
import { getDevice } from "../device";
import { validBotLocationData } from "../util";

export class JogButtons extends React.Component<JogMovementControlsProps, {}> {
  render() {
    const { location_data, mcu_params } = this.props.bot.hardware;
    const botLocationData = validBotLocationData(location_data);
    const directionAxesProps = {
      x: {
        isInverted: this.props.x_axis_inverted,
        stopAtHome: !!mcu_params.movement_stop_at_home_x,
        stopAtMax: !!mcu_params.movement_stop_at_max_x,
        axisLength: (mcu_params.movement_axis_nr_steps_x || 0)
          / (mcu_params.movement_step_per_mm_x || 1),
        negativeOnly: !!mcu_params.movement_home_up_x,
        position: botLocationData.position.x
      },
      y: {
        isInverted: this.props.y_axis_inverted,
        stopAtHome: !!mcu_params.movement_stop_at_home_y,
        stopAtMax: !!mcu_params.movement_stop_at_max_y,
        axisLength: (mcu_params.movement_axis_nr_steps_y || 0)
          / (mcu_params.movement_step_per_mm_y || 1),
        negativeOnly: !!mcu_params.movement_home_up_y,
        position: botLocationData.position.y
      },
      z: {
        isInverted: this.props.z_axis_inverted,
        stopAtHome: !!mcu_params.movement_stop_at_home_z,
        stopAtMax: !!mcu_params.movement_stop_at_max_z,
        axisLength: (mcu_params.movement_axis_nr_steps_z || 0)
          / (mcu_params.movement_step_per_mm_z || 1),
        negativeOnly: !!mcu_params.movement_home_up_z,
        position: botLocationData.position.z
      },
    };
    return <table className="jog-table" style={{ border: 0 }}>
      <tbody>
        <tr>
          <td>
            <button
              className="i fa fa-camera arrow-button fb-button"
              onClick={() => getDevice().takePhoto()} />
          </td>
          <td />
          <td />
          <td>
            <DirectionButton
              axis="y"
              direction="up"
              directionAxisProps={directionAxesProps.y}
              steps={this.props.bot.stepSize || 1000}
              disabled={this.props.disabled} />
          </td>
          <td />
          <td />
          <td>
            <DirectionButton
              axis="z"
              direction="up"
              directionAxisProps={directionAxesProps.z}
              steps={this.props.bot.stepSize || 1000}
              disabled={this.props.disabled} />
          </td>
        </tr>
        <tr>
          <td>
            <button
              className="i fa fa-home arrow-button fb-button"
              onClick={() => homeAll(100)}
              disabled={this.props.disabled || false} />
          </td>
          <td />
          <td>
            <DirectionButton
              axis="x"
              direction="left"
              directionAxisProps={directionAxesProps.x}
              steps={this.props.bot.stepSize || 1000}
              disabled={this.props.disabled} />
          </td>
          <td>
            <DirectionButton
              axis="y"
              direction="down"
              directionAxisProps={directionAxesProps.y}
              steps={this.props.bot.stepSize || 1000}
              disabled={this.props.disabled} />
          </td>
          <td>
            <DirectionButton
              axis="x"
              direction="right"
              directionAxisProps={directionAxesProps.x}
              steps={this.props.bot.stepSize || 1000}
              disabled={this.props.disabled} />
          </td>
          <td />
          <td>
            <DirectionButton
              axis="z"
              direction="down"
              directionAxisProps={directionAxesProps.z}
              steps={this.props.bot.stepSize || 1000}
              disabled={this.props.disabled} />
          </td>
        </tr>
        <tr>
          <td />
        </tr>
      </tbody>
    </table>;
  }
}
