import * as React from "react";
import { Row, Col, Help } from "../../../ui/index";
import { Position } from "@blueprintjs/core";

export const SingleSettingRow =
  ({ label, tooltip, settingType, children }: {
    label: string,
    tooltip: string,
    children: React.ReactChild,
    settingType: "button" | "input",
  }) =>
    <Row>
      <Col xs={6} className={"widget-body-tooltips"}>
        <label>{label}</label>
        <Help text={tooltip} requireClick={true} position={Position.RIGHT} />
      </Col>
      {settingType === "button"
        ? <Col xs={2} className={"centered-button-div"}>{children}</Col>
        : <Col xs={6}>{children}</Col>}
    </Row>;
