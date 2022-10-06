import React from "react";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";

export function SpacePanelHeader() {
  const width = 3;
  return <div className="label-headings">
    <Highlight settingName={DeviceSetting.axisHeadingLabels}>
      <Row>
        <Col xsOffset={3} xs={width} className={"centered-button-div low-pad"}>
          <label>
            {t("X AXIS")}
          </label>
        </Col>
        <Col xs={width} className={"centered-button-div low-pad"}>
          <label>
            {t("Y AXIS")}
          </label>
        </Col>
        <Col xs={width} className={"centered-button-div low-pad"}>
          <label>
            {t("Z AXIS")}
          </label>
        </Col>
      </Row>
    </Highlight>
  </div>;
}
