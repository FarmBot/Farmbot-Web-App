import * as React from "react";

import { DirectionButton } from "./controls/direction_button";

export interface State {
  isOpen: boolean;
  stepSize: number;
}

export interface Props {
  dispatch: Function;
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
            isInverted={false}
            steps={this.state.stepSize}
            disabled={false} />
          <DirectionButton
            axis="y"
            direction="up"
            isInverted={false}
            steps={this.state.stepSize}
            disabled={false} />
          <DirectionButton
            axis="y"
            direction="down"
            isInverted={false}
            steps={this.state.stepSize}
            disabled={false} />
          <DirectionButton
            axis="x"
            direction="left"
            isInverted={false}
            steps={this.state.stepSize}
            disabled={false} />
        </div>
      </div>
    </div>;
  }
}
