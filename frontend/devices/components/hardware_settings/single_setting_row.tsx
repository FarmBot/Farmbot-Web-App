import * as React from "react";
import { Row, Col, Help } from "../../../ui/index";
import { Position } from "@blueprintjs/core";
import { DeviceSetting } from "../../../constants";
import { Highlight } from "../maybe_highlight";
import { t } from "../../../i18next_wrapper";
import { DevSettings } from "../../../account/dev/dev_support";

export interface SingleSettingRowProps {
  label: DeviceSetting;
  tooltip: string;
  children: React.ReactChild;
  settingType: "button" | "input";
}

export const SingleSettingRow =
  ({ label, tooltip, settingType, children }: SingleSettingRowProps) => {
    const newFormat = DevSettings.futureFeaturesEnabled();
    return <Highlight settingName={label}>
      <Row>
        <Col xs={newFormat ? 12 : 6} className={"widget-body-tooltips"}>
          <label>{t(label)}</label>
          <Help text={tooltip} position={Position.RIGHT} />
        </Col>
        {settingType === "button"
          ? <Col xs={newFormat ? 5 : 2} className={"centered-button-div"}>
            {children}
          </Col>
          : <Col xs={newFormat ? 8 : 6}>{children}</Col>}
      </Row>
    </Highlight>;
  };
