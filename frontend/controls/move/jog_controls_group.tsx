import React from "react";
import { t } from "../../i18next_wrapper";
import { JogControlsGroupProps } from "./interfaces";
import { StepSizeSelector } from "./step_size_selector";
import { JogButtons } from "./jog_buttons";

export const JogControlsGroup = (props: JogControlsGroupProps) =>
  <div className={"jog-controls-group"}>
    <label className="text-center">
      {t("MOVE AMOUNT (mm)")}
    </label>
    <StepSizeSelector dispatch={props.dispatch} selected={props.stepSize} />
    <JogButtons
      stepSize={props.stepSize}
      botPosition={props.botPosition}
      getConfigValue={props.getConfigValue}
      arduinoBusy={props.arduinoBusy}
      botOnline={props.botOnline}
      env={props.env}
      firmwareSettings={props.firmwareSettings} />
  </div>;
