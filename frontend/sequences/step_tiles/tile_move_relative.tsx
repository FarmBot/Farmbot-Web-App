import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Row } from "../../ui";
import { t } from "../../i18next_wrapper";

export const TileMoveRelative = (props: StepParams) => {
  const { dispatch, currentStep, index, currentSequence } = props;
  return <StepWrapper {...props}
    className={"move-relative-step"}
    helpText={ToolTips.MOVE_RELATIVE}>
    <Row className="grid-4-col">
      <div>
        <label>{t("X (mm)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="x" />
      </div>
      <div>
        <label>{t("Y (mm)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="y" />
      </div>
      <div>
        <label>{t("Z (mm)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="z" />
      </div>
      <div>
        <label>{t("Speed (%)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="speed" />
      </div>
    </Row>
  </StepWrapper>;
};
