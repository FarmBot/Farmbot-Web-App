import * as React from "react";
import { MCUFactoryReset, bulkToggleControlPanel } from "../actions";
import { Widget, WidgetHeader, WidgetBody } from "../../ui/index";
import { HardwareSettingsProps } from "../interfaces";
import { MustBeOnline, isBotOnline } from "../must_be_online";
import { ToolTips } from "../../constants";
import { DangerZone } from "./hardware_settings/danger_zone";
import { PinGuard } from "./hardware_settings/pin_guard";
import { EncodersAndEndStops } from "./hardware_settings/encoders_and_endstops";
import { Motors } from "./hardware_settings/motors";
import { SpacePanelHeader } from "./hardware_settings/space_panel_header";
import {
  HomingAndCalibration
} from "./hardware_settings/homing_and_calibration";
import { Popover, Position } from "@blueprintjs/core";
import { FwParamExportMenu } from "./hardware_settings/export_menu";
import { t } from "../../i18next_wrapper";

export class HardwareSettings extends
  React.Component<HardwareSettingsProps, {}> {

  render() {
    const {
      bot, dispatch, sourceFwConfig, controlPanelState, firmwareConfig,
      botToMqttStatus, firmwareHardware, resources
    } = this.props;
    const { informational_settings } = this.props.bot.hardware;
    const firmwareVersion = informational_settings.firmware_version;
    const { sync_status } = informational_settings;
    const botDisconnected = !isBotOnline(sync_status, botToMqttStatus);
    return <Widget className="hardware-widget">
      <WidgetHeader title={t("Hardware")} helpText={ToolTips.HW_SETTINGS}>
        <MustBeOnline
          hideBanner={true}
          syncStatus={sync_status}
          networkState={this.props.botToMqttStatus}
          lockOpen={process.env.NODE_ENV !== "production"}>
        </MustBeOnline>
      </WidgetHeader>
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
        {firmwareConfig &&
          <Popover position={Position.BOTTOM_RIGHT}>
            <i className="fa fa-download" />
            <FwParamExportMenu firmwareConfig={firmwareConfig} />
          </Popover>}
        <MustBeOnline
          networkState={this.props.botToMqttStatus}
          syncStatus={sync_status}
          lockOpen={process.env.NODE_ENV !== "production" || !!firmwareConfig}>
          <div className="label-headings">
            <SpacePanelHeader />
          </div>
          <HomingAndCalibration
            dispatch={dispatch}
            bot={bot}
            sourceFwConfig={sourceFwConfig}
            firmwareConfig={firmwareConfig}
            botDisconnected={botDisconnected} />
          <Motors
            dispatch={dispatch}
            firmwareVersion={firmwareVersion}
            controlPanelState={controlPanelState}
            sourceFwConfig={sourceFwConfig}
            isValidFwConfig={!!firmwareConfig}
            firmwareHardware={firmwareHardware} />
          <EncodersAndEndStops
            dispatch={dispatch}
            shouldDisplay={this.props.shouldDisplay}
            controlPanelState={controlPanelState}
            sourceFwConfig={sourceFwConfig} />
          <PinGuard
            dispatch={dispatch}
            resources={resources}
            controlPanelState={controlPanelState}
            sourceFwConfig={sourceFwConfig} />
          <DangerZone
            dispatch={dispatch}
            controlPanelState={controlPanelState}
            onReset={MCUFactoryReset}
            botDisconnected={botDisconnected} />
        </MustBeOnline>
      </WidgetBody>
    </Widget>;
  }
}
