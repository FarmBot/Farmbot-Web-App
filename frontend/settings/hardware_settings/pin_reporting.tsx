import React from "react";
import { PinReportingMCUInputGroup } from "./pin_reporting_input_group";
import { PinReportingProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";

export const PinReporting = (props: PinReportingProps) => {
  const commonProps = {
    dispatch: props.dispatch,
    resources: props.resources,
    disabled: true,
    sourceFwConfig: props.sourceFwConfig,
    firmwareHardware: props.firmwareHardware,
  };
  return <Highlight className={"section"}
    settingName={DeviceSetting.pinReporting}>
    <Header
      expanded={props.settingsPanelState.pin_reporting}
      title={DeviceSetting.pinReporting}
      panel={"pin_reporting"}
      dispatch={props.dispatch} />
    <Collapse isOpen={!!props.settingsPanelState.pin_reporting}>
      <PinReportingMCUInputGroup {...commonProps}
        label={DeviceSetting.pinReporting1}
        pinNumKey={"pin_report_1_pin_nr"} />
      <PinReportingMCUInputGroup {...commonProps}
        label={DeviceSetting.pinReporting2}
        pinNumKey={"pin_report_2_pin_nr"} />
    </Collapse>
  </Highlight>;
};
