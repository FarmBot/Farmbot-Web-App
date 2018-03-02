import * as React from "react";
import { DirectionButton } from "./direction_button";
import { homeAll } from "../devices/actions";
import { JogMovementControlsProps, DirectionButtonProps } from "./interfaces";
import { getDevice } from "../device";
import { validBotLocationData } from "../util";
import { Axis } from "../devices/interfaces";

export class JogButtons extends React.Component<JogMovementControlsProps, {}> {
  render() {
    const { location_data, mcu_params } = this.props.bot.hardware;
    const botLocationData = validBotLocationData(location_data);
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
