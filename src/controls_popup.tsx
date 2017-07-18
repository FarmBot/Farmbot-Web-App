import * as React from "react";
import { connect } from "react-redux";

import { DirectionButton } from "./controls/direction_button";

interface State {
  isOpen: boolean;
  stepSize: number;
}

interface Props {
  dispatch: Function;
}

export class ControlsPopup extends React.Component<Props, Partial<State>> {

  state: State = {
    isOpen: false,
    stepSize: 1000
  };

  toggle = (property: keyof State) => () =>
    this.setState({ [property]: !this.state[property] });

  public render() {
    let isOpen = this.state.isOpen ? "open" : "";
    return (
      <div
        className={"controls-popup " + isOpen}
        onClick={this.toggle("isOpen")}
      >
        <i className="fa fa-plus" />
        <div className="controls-popup-menu-outer">
          <div className="controls-popup-menu-inner">
            <DirectionButton
              axis="z"
              direction="up"
              isInverted={false}
              steps={this.state.stepSize}
            />
            <DirectionButton
              axis="x"
              direction="left"
              isInverted={false}
              steps={this.state.stepSize}
            />
            <DirectionButton
              axis="y"
              direction="down"
              isInverted={false}
              steps={this.state.stepSize}
            />
            <DirectionButton
              axis="z"
              direction="right"
              isInverted={false}
              steps={this.state.stepSize}
            />
          </div>
        </div>
      </div>
    );
  }
}
