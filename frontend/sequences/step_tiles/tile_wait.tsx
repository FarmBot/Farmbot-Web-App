import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { t } from "../../i18next_wrapper";

export const TileWait = (props: StepParams) =>
  <StepWrapper {...props}
    className={"wait-step"}
    helpText={ToolTips.WAIT}>
    <div className="row grid-2-col">
      <label>{t("Time in milliseconds")}</label>
      <StepInputBox field={"milliseconds"}
        dispatch={props.dispatch}
        step={props.currentStep}
        sequence={props.currentSequence}
        index={props.index} />
    </div>
  </StepWrapper>;
