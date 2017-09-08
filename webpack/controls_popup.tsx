import * as React from "react";

import { DirectionButton } from "./controls/direction_button";
import { Xyz } from "./devices/interfaces";

export interface State {
  isOpen: boolean;
  stepSize: number;
}

export interface Props {
  dispatch: Function;
  axisInversion: Record<Xyz, boolean>;
}

export class ControlsPopup extends React.Component<Props, Partial<State>> {

  state: State = {
    isOpen: false,
    stepSize: 100
  };

  toggle = (property: keyof State) => () =>
    this.setState({ [property]: !this.state[property] });

  public render() {
    const isOpen = this.state.isOpen ? "open" : "";
    return <div
      className={"controls-popup " + isOpen}>
      <i className="fa fa-crosshairs"
        onClick={this.toggle("isOpen")} />
      <div className="controls-popup-menu-outer">
        <div className="controls-popup-menu-inner">
          <DirectionButton
            axis="x"
            direction="right"
            isInverted={this.props.axisInversion.x}
            steps={this.state.stepSize}
            disabled={!isOpen} />
          <DirectionButton
            axis="y"
            direction="up"
            isInverted={this.props.axisInversion.y}
            steps={this.state.stepSize}
            disabled={!isOpen} />
          <DirectionButton
            axis="y"
            direction="down"
            isInverted={this.props.axisInversion.y}
            steps={this.state.stepSize}
            disabled={!isOpen} />
          <DirectionButton
            axis="x"
            direction="left"
            isInverted={this.props.axisInversion.x}
            steps={this.state.stepSize}
            disabled={!isOpen} />
        </div>
      </div>
    </div>;
  }
}
