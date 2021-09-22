import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";

export const TileSystemAction = (props: StepParams) =>
  <StepWrapper {...props}
    className={"system-action-step"}
    helpText={ToolTips.SYSTEM_ACTION} />;
