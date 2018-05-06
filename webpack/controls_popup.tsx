import * as React from "react";

import { DirectionButton } from "./controls/direction_button";
import { getDevice } from "./device";
import { buildDirectionProps } from "./controls/direction_axes_props";
import { ControlsPopupProps } from "./controls/interfaces";
import { commandErr } from "./devices/actions";

interface State {
  isOpen: boolean;
}

export class ControlsPopup
  extends React.Component<ControlsPopupProps, Partial<State>> {
  state: State = { isOpen: false };

  private toggle = (property: keyof State) => () =>
    this.setState({ [property]: !this.state[property] });

  public render() {
    const isOpen = this.state.isOpen ? "open" : "";
    const { stepSize, xySwap, arduinoBusy } = this.props;
    const directionAxesProps = buildDirectionProps(this.props);
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
            steps={stepSize}
            disabled={!isOpen || arduinoBusy} />
          <DirectionButton
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]}
            steps={stepSize}
            disabled={!isOpen || arduinoBusy} />
          <DirectionButton
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]}
            steps={stepSize}
            disabled={!isOpen || arduinoBusy} />
          <DirectionButton
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]}
            steps={stepSize}
            disabled={!isOpen || arduinoBusy} />
          <button
            className="i fa fa-camera arrow-button fb-button brown"
            onClick={() => getDevice().takePhoto().catch(commandErr("Photo"))} />
        </div>
      </div>
    </div>;
  }
}
