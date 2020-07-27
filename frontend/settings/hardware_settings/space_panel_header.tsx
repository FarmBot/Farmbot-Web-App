import * as React from "react";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";

export function SpacePanelHeader() {
  const width = 4;
  return <div className="label-headings">
    <Highlight settingName={DeviceSetting.axisHeadingLabels}>
      <Row>
        <Col xs={width} className={"centered-button-div"}>
          <label>
            {t("X AXIS")}
          </label>
        </Col>
        <Col xs={width} className={"centered-button-div"}>
          <label>
            {t("Y AXIS")}
          </label>
        </Col>
        <Col xs={width} className={"centered-button-div"}>
          <label>
            {t("Z AXIS")}
          </label>
        </Col>
      </Row>
    </Highlight>
  </div>;
}
