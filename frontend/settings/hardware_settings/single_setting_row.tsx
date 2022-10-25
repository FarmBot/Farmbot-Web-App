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
  advanced?: boolean;
  showAdvanced?: boolean;
  modified?: boolean;
}

export const SingleSettingRow = (props: SingleSettingRowProps) => {
  const { label, tooltip, settingType, children } = props;
  return <Highlight settingName={label}
    hidden={props.advanced && !(props.showAdvanced || props.modified)}
    className={props.advanced ? "advanced" : undefined}>
    <Row className={"single-setting-row"}>
      <Col xs={7} className={"widget-body-tooltips"}>
        <label>{t(label)}</label>
        <Help text={tooltip} position={Position.RIGHT} />
      </Col>
      {settingType === "button"
        ? <Col xs={5} className={"centered-button-div low-pad"}>
          {children}
        </Col>
        : <Col xs={5} className={"low-pad"}>{children}</Col>}
    </Row>
  </Highlight>;
};
