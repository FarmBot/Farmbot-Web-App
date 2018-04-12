import * as React from "react";

import { DirectionButton } from "./controls/direction_button";
import { Xyz, BotPosition } from "./devices/interfaces";
import { McuParams } from "farmbot";
import { getDevice } from "./device";

interface State {
  isOpen: boolean;
  stepSize: number;
}

interface Props {
  dispatch: Function;
  axisInversion: Record<Xyz, boolean>;
  botPosition: BotPosition;
  mcuParams: McuParams;
  xySwap: boolean;
}

export class ControlsPopup extends React.Component<Props, Partial<State>> {

  state: State = {
    isOpen: false,
    stepSize: 100
  };

  private toggle = (property: keyof State) => () =>
    this.setState({ [property]: !this.state[property] });

  public render() {
    const isOpen = this.state.isOpen ? "open" : "";
    const { mcuParams, xySwap } = this.props;
    const directionAxesProps = {
      x: {
        isInverted: this.props.axisInversion.x,
        stopAtHome: !!mcuParams.movement_stop_at_home_x,
        stopAtMax: !!mcuParams.movement_stop_at_max_x,
        axisLength: (mcuParams.movement_axis_nr_steps_x || 0)
          / (mcuParams.movement_step_per_mm_x || 1),
        negativeOnly: !!mcuParams.movement_home_up_x,
        position: this.props.botPosition.x
      },
      y: {
        isInverted: this.props.axisInversion.y,
        stopAtHome: !!mcuParams.movement_stop_at_home_y,
        stopAtMax: !!mcuParams.movement_stop_at_max_y,
        axisLength: (mcuParams.movement_axis_nr_steps_y || 0)
          / (mcuParams.movement_step_per_mm_y || 1),
        negativeOnly: !!mcuParams.movement_home_up_y,
        position: this.props.botPosition.y
      }
    };
    const rightLeft = xySwap ? "y" : "x";
    const upDown = xySwap ? "x" : "y";
    return <div
      className={"controls-popup " + isOpen}>
      <i className="fa fa-crosshairs"
        onClick={this.toggle("isOpen")} />
      <div className="controls-popup-menu-outer">
        <div className="controls-popup-menu-inner">
          <DirectionButton
            axis={rightLeft}
            direction="right"
            directionAxisProps={directionAxesProps[rightLeft]}
            steps={this.state.stepSize}
            disabled={!isOpen} />
          <DirectionButton
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]}
            steps={this.state.stepSize}
            disabled={!isOpen} />
          <DirectionButton
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]}
            steps={this.state.stepSize}
            disabled={!isOpen} />
          <DirectionButton
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]}
            steps={this.state.stepSize}
            disabled={!isOpen} />
          <button
            className="i fa fa-camera arrow-button fb-button brown"
            onClick={() => getDevice().takePhoto().catch(() => { })} />
        </div>
      </div>
    </div>;
  }
}
