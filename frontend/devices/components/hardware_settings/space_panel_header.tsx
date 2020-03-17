import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "../../../i18next_wrapper";
import { DevSettings } from "../../../account/dev/dev_support";

export function SpacePanelHeader() {
  const newFormat = DevSettings.futureFeaturesEnabled();
  const width = newFormat ? 4 : 2;
  const offset = newFormat ? 0 : 6;
  return <div className="label-headings">
    <Row>
      <Col xs={width} xsOffset={offset} className={"centered-button-div"}>
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
  </div>;
}
