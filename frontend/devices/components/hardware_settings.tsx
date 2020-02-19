import * as React from "react";
import { MCUFactoryReset, bulkToggleControlPanel } from "../actions";
import { Widget, WidgetHeader, WidgetBody } from "../../ui/index";
import { HardwareSettingsProps } from "../interfaces";
import { isBotOnline } from "../must_be_online";
import { ToolTips } from "../../constants";
import { DangerZone } from "./hardware_settings/danger_zone";
import { PinGuard } from "./hardware_settings/pin_guard";
import { Encoders } from "./hardware_settings/encoders";
import { EndStops } from "./hardware_settings/endstops";
import { Motors } from "./hardware_settings/motors";
import { SpacePanelHeader } from "./hardware_settings/space_panel_header";
import {
  HomingAndCalibration
} from "./hardware_settings/homing_and_calibration";
import { Popover, Position } from "@blueprintjs/core";
import { FwParamExportMenu } from "./hardware_settings/export_menu";
import { t } from "../../i18next_wrapper";
import { PinBindings } from "./hardware_settings/pin_bindings";
import { ErrorHandling } from "./hardware_settings/error_handling";
import { maybeOpenPanel } from "./maybe_highlight";

export class HardwareSettings extends
  React.Component<HardwareSettingsProps, {}> {

  componentDidMount = () =>
    this.props.dispatch(maybeOpenPanel(this.props.controlPanelState));

  render() {
    const {
      bot, dispatch, sourceFwConfig, controlPanelState, firmwareConfig,
      botToMqttStatus, firmwareHardware, resources
    } = this.props;
    const { informational_settings } = this.props.bot.hardware;
    const { sync_status } = informational_settings;
    const botDisconnected = !isBotOnline(sync_status, botToMqttStatus);
    const commonProps = { dispatch, controlPanelState };
    return <Widget className="hardware-widget">
      <WidgetHeader title={t("Hardware")} helpText={ToolTips.HW_SETTINGS} />
      <WidgetBody>
        <button
          className={"fb-button gray no-float"}
          onClick={() => dispatch(bulkToggleControlPanel(true))}>
          {t("Expand All")}
        </button>
        <button
          className={"fb-button gray no-float"}
          onClick={() => dispatch(bulkToggleControlPanel(false))}>
          {t("Collapse All")}
        </button>
        <Popover position={Position.BOTTOM_RIGHT}>
          <i className="fa fa-download" />
          <FwParamExportMenu firmwareConfig={firmwareConfig} />
        </Popover>
        <div className="label-headings">
          <SpacePanelHeader />
        </div>
        <HomingAndCalibration {...commonProps}
          bot={bot}
          sourceFwConfig={sourceFwConfig}
          firmwareConfig={firmwareConfig}
          firmwareHardware={firmwareHardware}
          botDisconnected={botDisconnected} />
        <Motors {...commonProps}
          sourceFwConfig={sourceFwConfig}
          firmwareHardware={firmwareHardware} />
        <Encoders {...commonProps}
          sourceFwConfig={sourceFwConfig}
          firmwareHardware={firmwareHardware} />
        <EndStops {...commonProps}
          sourceFwConfig={sourceFwConfig} />
        <ErrorHandling {...commonProps}
          sourceFwConfig={sourceFwConfig} />
        <PinGuard {...commonProps}
          resources={resources}
          sourceFwConfig={sourceFwConfig} />
        <DangerZone {...commonProps}
          onReset={MCUFactoryReset}
          botDisconnected={botDisconnected} />
        <PinBindings  {...commonProps}
          resources={resources} />
      </WidgetBody>
    </Widget>;
  }
}
