import * as React from "react";
import { DirectionButton } from "./direction_button";
import { homeAll } from "../devices/actions";
import { JogMovementControlsProps } from "./interfaces";

export class JogButtons extends React.Component<JogMovementControlsProps, {}> {
  render() {
    return <table className="jog-table" style={{ border: 0 }}>
      <tbody>
        <tr>
          <td />
          <td />
          <td />
          <td>
            <DirectionButton
              axis="y"
              direction="up"
              isInverted={this.props.y_axis_inverted}
              steps={this.props.bot.stepSize || 1000}
            />
          </td>
          <td />
          <td />
          <td>
            <DirectionButton
              axis="z"
              direction="up"
              isInverted={this.props.z_axis_inverted}
              steps={this.props.bot.stepSize || 1000}
            />
          </td>
        </tr>
        <tr>
          <td>
            <button
              className="i fa fa-home arrow-button fb-button"
              onClick={() => homeAll(100)}
            />
          </td>
          <td />
          <td>
            <DirectionButton
              axis="x"
              direction="left"
              isInverted={this.props.x_axis_inverted}
              steps={this.props.bot.stepSize || 1000}
            />
          </td>
          <td>
            <DirectionButton
              axis="y"
              direction="down"
              isInverted={this.props.y_axis_inverted}
              steps={this.props.bot.stepSize || 1000}
            />
          </td>
          <td>
            <DirectionButton
              axis="x"
              direction="right"
              isInverted={this.props.x_axis_inverted}
              steps={this.props.bot.stepSize || 1000}
            />
          </td>
          <td />
          <td>
            <DirectionButton
              axis="z"
              direction="down"
              isInverted={this.props.z_axis_inverted}
              steps={this.props.bot.stepSize || 1000}
            />
          </td>
        </tr>
        <tr>
          <td />
        </tr>
      </tbody>
    </table>;
  }
}
