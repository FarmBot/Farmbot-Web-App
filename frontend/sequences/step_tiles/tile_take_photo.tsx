import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import { StepWrapper, StepWarning } from "../step_ui";
import { Row } from "../../ui";
import { Link } from "../../link";
import { t } from "../../i18next_wrapper";
import { Path } from "../../internal_urls";

export const TileTakePhoto = (props: StepParams) =>
  <StepWrapper {...props}
    className={"take-photo-step"}
    helpText={ToolTips.TAKE_PHOTO}
    warning={props.farmwareData &&
      props.farmwareData.cameraDisabled &&
      <StepWarning
        titleBase={t(Content.NO_CAMERA_SELECTED)}
        warning={t(ToolTips.SELECT_A_CAMERA)} />}>
    <Row>
      <p>
        {`${t("Photos are viewable from the")} `}
        <Link to={Path.photos()}>
          {t("photos panel")}
        </Link>.
      </p>
    </Row>
  </StepWrapper>;
