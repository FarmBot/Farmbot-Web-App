import React from "react";
import { Row, Help } from "../../ui";
import { Position } from "@blueprintjs/core";
import { DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { t } from "../../i18next_wrapper";

export interface SingleSettingRowProps {
  label: DeviceSetting;
  tooltip: string;
  children: React.ReactNode;
  settingType: "button" | "input";
  advanced?: boolean;
  showAdvanced?: boolean;
  modified?: boolean;
}

export const SingleSettingRow = (props: SingleSettingRowProps) => {
  const { label, tooltip, children } = props;
  return <Highlight settingName={label}
    hidden={props.advanced && !(props.showAdvanced || props.modified)}
    className={props.advanced ? "advanced" : undefined}>
    <Row className={"single-setting-grid"}>
      <div>
        <label>{t(label)}</label>
        <Help text={tooltip} position={Position.RIGHT} />
      </div>
      {children}
    </Row>
  </Highlight>;
};
