import React from "react";
import { Row } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";

export const SpacePanelHeader = () =>
  <div className="label-headings">
    <Highlight settingName={DeviceSetting.axisHeadingLabels}>
      <div></div>
      <Row className="axes-grid-header">
        <div></div>
        <label>
          {t("X AXIS")}
        </label>
        <label>
          {t("Y AXIS")}
        </label>
        <label>
          {t("Z AXIS")}
        </label>
      </Row>
    </Highlight>
  </div>;
