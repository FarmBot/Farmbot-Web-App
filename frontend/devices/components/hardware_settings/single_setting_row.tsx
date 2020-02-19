import * as React from "react";
import { Row, Col, Help } from "../../../ui/index";
import { Position } from "@blueprintjs/core";
import { DeviceSetting } from "../../../constants";
import { Highlight } from "../maybe_highlight";
import { t } from "../../../i18next_wrapper";

export interface SingleSettingRowProps {
  label: DeviceSetting;
  tooltip: string;
  children: React.ReactChild;
  settingType: "button" | "input";
}

export const SingleSettingRow =
  ({ label, tooltip, settingType, children }: SingleSettingRowProps) =>
    <Row>
      <Highlight settingName={label}>
        <Col xs={6} className={"widget-body-tooltips"}>
          <label>{t(label)}</label>
          <Help text={tooltip} requireClick={true} position={Position.RIGHT} />
        </Col>
        {settingType === "button"
          ? <Col xs={2} className={"centered-button-div"}>{children}</Col>
          : <Col xs={6}>{children}</Col>}
      </Highlight>
    </Row>;
