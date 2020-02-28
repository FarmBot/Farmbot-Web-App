import * as React from "react";
import { DirectionButton } from "./controls/move/direction_button";
import { getDevice } from "./device";
import { buildDirectionProps } from "./controls/move/direction_axes_props";
import { ControlsPopupProps } from "./controls/move/interfaces";
import { commandErr } from "./devices/actions";
import { mapPanelClassName } from "./farm_designer/map/util";
import {
  cameraBtnProps,
} from "./devices/components/fbos_settings/camera_selection";
import { t } from "./i18next_wrapper";

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
    const { stepSize, xySwap, arduinoBusy, botOnline } = this.props;
    const directionAxesProps = buildDirectionProps(this.props);
    const rightLeft = xySwap ? "y" : "x";
    const upDown = xySwap ? "x" : "y";
    const movementDisabled = !isOpen || arduinoBusy || !botOnline;
    const commonProps = { steps: stepSize, disabled: movementDisabled };
    const camDisabled = cameraBtnProps(this.props.env);
    return <div
      className={`controls-popup ${isOpen} ${mapPanelClassName()}`}>
      <i className="fa fa-crosshairs"
        onClick={this.toggle("isOpen")} />
      <div className="controls-popup-menu-outer">
        <div className="controls-popup-menu-inner">
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="right"
            directionAxisProps={directionAxesProps[rightLeft]} />
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]} />
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]} />
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]} />
          <button
            className={`fa fa-camera arrow-button fb-button brown ${
              camDisabled.class}`}
            disabled={!isOpen || !botOnline}
            title={camDisabled.title || t("Take a photo")}
            onClick={camDisabled.click ||
              (() => getDevice().takePhoto().catch(commandErr("Photo")))} />
        </div>
      </div>
    </div>;
  }
}
