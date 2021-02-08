import React from "react";
import { McuParams } from "farmbot";
import { BotPosition, UserEnv } from "../../devices/interfaces";
import { StepSizeSelector } from "./step_size_selector";
import { GetWebAppBool } from "./interfaces";
import { JogButtons } from "./jog_buttons";
import { t } from "../../i18next_wrapper";

export interface JogControlsGroupProps {
  dispatch: Function;
  stepSize: number;
  botPosition: BotPosition;
  getValue: GetWebAppBool;
  arduinoBusy: boolean;
  firmwareSettings: McuParams;
  env: UserEnv;
}

export const JogControlsGroup = (props: JogControlsGroupProps) => {
  const {
    dispatch, stepSize, botPosition, getValue, arduinoBusy, firmwareSettings
  } = props;
  return <div className={"jog-controls-group"}>
    <label className="text-center">
      {t("MOVE AMOUNT (mm)")}
    </label>
    <StepSizeSelector dispatch={dispatch} selected={stepSize} />
    <JogButtons
      stepSize={stepSize}
      botPosition={botPosition}
      getConfigValue={getValue}
      disabled={arduinoBusy}
      env={props.env}
      firmwareSettings={firmwareSettings} />
  </div>;
};
