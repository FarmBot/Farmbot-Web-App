import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { t } from "../../i18next_wrapper";
import { PinModeDropdown, PinSelect } from "./pin_support";
import { ReadPin } from "farmbot";

export const TileReadPin = (props: StepParams<ReadPin>) =>
  <StepWrapper {...props}
    className={"read-pin-step"}
    helpText={ToolTips.READ_PIN}>
    <div className="grid">
      <PinSelect {...props}
        label={t("sensor or peripheral")}
        placeholder={t("Select a sensor")} />
      <PinModeDropdown {...props} />
      <div className="row grid-2-col">
        <label>{t("Data Label")}</label>
        <StepInputBox field={"label"}
          dispatch={props.dispatch}
          index={props.index}
          step={props.currentStep}
          sequence={props.currentSequence} />
      </div>
    </div>
  </StepWrapper>;
