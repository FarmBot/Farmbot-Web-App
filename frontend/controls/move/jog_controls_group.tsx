import * as React from "react";
import { McuParams } from "farmbot";
import { BotPosition } from "../../devices/interfaces";
import { changeStepSize } from "../../devices/actions";
import { StepSizeSelector } from "./step_size_selector";
import { GetWebAppBool } from "./interfaces";
import { JogButtons } from "./jog_buttons";
import { BooleanSetting } from "../../session_keys";
import { t } from "../../i18next_wrapper";

interface JogControlsGroupProps {
  dispatch: Function;
  stepSize: number;
  botPosition: BotPosition;
  getValue: GetWebAppBool;
  arduinoBusy: boolean;
  firmwareSettings: McuParams;
}

export const JogControlsGroup = (props: JogControlsGroupProps) => {
  const {
    dispatch, stepSize, botPosition, getValue, arduinoBusy, firmwareSettings
  } = props;
  return <div>
    <label className="text-center">
      {t("MOVE AMOUNT (mm)")}
    </label>
    <StepSizeSelector
      choices={[1, 10, 100, 1000, 10000]}
      selector={num => dispatch(changeStepSize(num))}
      selected={stepSize} />
    <JogButtons
      stepSize={stepSize}
      botPosition={botPosition}
      axisInversion={{
        x: getValue(BooleanSetting.x_axis_inverted),
        y: getValue(BooleanSetting.y_axis_inverted),
        z: getValue(BooleanSetting.z_axis_inverted)
      }}
      arduinoBusy={arduinoBusy}
      firmwareSettings={firmwareSettings}
      xySwap={getValue(BooleanSetting.xy_swap)}
      doFindHome={getValue(BooleanSetting.home_button_homing)} />
  </div>;
};
