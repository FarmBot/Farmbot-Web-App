import React from "react";
import { ControlsPopupProps } from "./controls/move/interfaces";
import { mapPanelClassName } from "./farm_designer/map/util";
import { getPathArray } from "./history";
import { JogButtons } from "./controls/move/jog_buttons";
import { StepSizeSelector } from "./controls/move/step_size_selector";

export const ControlsPopup = (props: ControlsPopupProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isOpenClass = isOpen ? "open" : "";
  const { stepSize, arduinoBusy, botOnline } = props;
  const movementDisabled = !isOpen || arduinoBusy || !botOnline;
  return <div
    className={`controls-popup ${isOpenClass} ${mapPanelClassName()}`}>
    <i className="fa fa-crosshairs" onClick={() => setIsOpen(!isOpen)} />
    <div className="controls-popup-menu-outer">
      <div className="controls-popup-menu-inner">
        <JogButtons
          stepSize={stepSize}
          botPosition={props.botPosition}
          getConfigValue={props.getConfigValue}
          disabled={movementDisabled}
          env={props.env}
          firmwareSettings={props.firmwareSettings} />
        <StepSizeSelector dispatch={props.dispatch} selected={stepSize} />
      </div>
    </div>
  </div>;
};

export const showControlsPopup = () => {
  const currentPage = getPathArray()[2] || "";
  const currentPanel = getPathArray()[3] || "";
  const pagesNotShown = ["account", "regimens"];
  const panelsNotShown = ["controls"];
  const hide = pagesNotShown.includes(currentPage)
    || (currentPage == "designer" && panelsNotShown.includes(currentPanel));
  return !hide;
};
