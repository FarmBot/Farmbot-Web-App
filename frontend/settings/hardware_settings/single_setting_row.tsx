import React from "react";
import { Row, Col, Help } from "../../ui";
import { Position } from "@blueprintjs/core";
import { DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { t } from "../../i18next_wrapper";

export interface SingleSettingRowProps {
  label: DeviceSetting;
  tooltip: string;
  children: React.ReactChild;
  settingType: "button" | "input";
}

export const SingleSettingRow =
  ({ label, tooltip, settingType, children }: SingleSettingRowProps) => {
    return <Highlight settingName={label}>
      <Row>
        <Col xs={7} className={"widget-body-tooltips"}>
          <label>{t(label)}</label>
          <Help text={tooltip} position={Position.RIGHT} />
        </Col>
        {settingType === "button"
          ? <Col xs={5} className={"centered-button-div"}>
            {children}
          </Col>
          : <Col xs={5}>{children}</Col>}
      </Row>
    </Highlight>;
  };
