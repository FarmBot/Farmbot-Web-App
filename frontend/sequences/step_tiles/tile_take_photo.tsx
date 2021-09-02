import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import { StepWrapper, StepWarning } from "../step_ui";
import { Col, Row } from "../../ui";
import { Link } from "../../link";
import { t } from "../../i18next_wrapper";

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
      <Col xs={12}>
        <p>
          {`${t("Photos are viewable from the")} `}
          <Link to={"/app/designer/photos"}>
            {t("photos panel")}
          </Link>.
        </p>
      </Col>
    </Row>
  </StepWrapper>;
