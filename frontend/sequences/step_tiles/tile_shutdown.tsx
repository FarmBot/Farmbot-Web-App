import React from "react";
import { StepParams } from "../interfaces";
import { Content } from "../../constants";
import { StepWrapper } from "../step_ui";
import { t } from "../../i18next_wrapper";

export const TileShutdown = (props: StepParams) =>
  <StepWrapper {...props}
    className={"shutdown-step"}
    helpText={Content.SHUTDOWN_FARMBOT}>
    <p>{t(Content.SHUTDOWN_STEP)}</p>
  </StepWrapper>;
