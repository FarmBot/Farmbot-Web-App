import React from "react";
import { ControlsPopupProps } from "./controls/move/interfaces";
import { mapPanelClassName } from "./farm_designer/map/util";
import { getPathArray } from "./history";
import { JogButtons } from "./controls/move/jog_buttons";
import { StepSizeSelector } from "./controls/move/step_size_selector";
import { Icon, iconFile } from "./farm_designer/panel_header";
import { Actions } from "./constants";

export const ControlsPopup = (props: ControlsPopupProps) => {
  const { isOpen, dispatch, stepSize, arduinoBusy, locked, botOnline } = props;
  const isOpenClass = isOpen ? "open" : "";
  return <div
    className={`controls-popup ${isOpenClass} ${mapPanelClassName()}`}>
    <img width={25} height={25} src={iconFile(Icon.controls)}
      onClick={() =>
        dispatch({ type: Actions.OPEN_CONTROLS_POPUP, payload: !isOpen })} />
    <div className="controls-popup-menu-outer">
      <div className="controls-popup-menu-inner">
        <JogButtons
          stepSize={stepSize}
          botPosition={props.botPosition}
          getConfigValue={props.getConfigValue}
          arduinoBusy={arduinoBusy}
          locked={locked}
          botOnline={isOpen && botOnline}
          env={props.env}
          firmwareSettings={props.firmwareSettings} />
        <StepSizeSelector dispatch={dispatch} selected={stepSize} />
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
