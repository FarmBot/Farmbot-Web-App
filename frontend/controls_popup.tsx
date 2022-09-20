import React from "react";
import { ControlsPopupProps } from "./controls/move/interfaces";
import { mapPanelClassName } from "./farm_designer/map/util";
import { JogButtons } from "./controls/move/jog_buttons";
import { StepSizeSelector } from "./controls/move/step_size_selector";
import { Actions } from "./constants";
import { FilePath, Icon } from "./internal_urls";

export const ControlsPopup = (props: ControlsPopupProps) => {
  const { isOpen, dispatch, stepSize, arduinoBusy, locked, botOnline } = props;
  const isOpenClass = isOpen ? "open" : "";
  return <div
    className={`controls-popup ${isOpenClass} ${mapPanelClassName()}`}>
    <img width={25} height={25} src={FilePath.icon(Icon.controls)}
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
          imageJobs={props.imageJobs}
          logs={props.logs}
          dispatch={props.dispatch}
          movementState={props.movementState}
          firmwareSettings={props.firmwareSettings} />
        <StepSizeSelector dispatch={dispatch} selected={stepSize} />
      </div>
    </div>
  </div>;
};
