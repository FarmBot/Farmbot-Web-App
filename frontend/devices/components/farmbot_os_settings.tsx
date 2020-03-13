import * as React from "react";
import { FarmbotOsProps, Feature, FarmbotSettingsProps } from "../interfaces";
import { Widget, WidgetHeader, WidgetBody } from "../../ui";
import { isBotOnlineFromState } from "../must_be_online";
import { CameraSelection } from "./fbos_settings/camera_selection";
import { FarmbotOsRow } from "./fbos_settings/farmbot_os_row";
import { AutoUpdateRow } from "./fbos_settings/auto_update_row";
import { AutoSyncRow } from "./fbos_settings/auto_sync_row";
import { PowerAndReset } from "./fbos_settings/power_and_reset";
import { BootSequenceSelector } from "./fbos_settings/boot_sequence_selector";
import { OtaTimeSelectorRow } from "./fbos_settings/ota_time_selector";
import { NameRow } from "./fbos_settings/name_row";
import { TimezoneRow } from "./fbos_settings/timezone_row";
import { Firmware } from "./fbos_settings/firmware";
import { Highlight } from "./maybe_highlight";
import { Header } from "./hardware_settings/header";
import { DeviceSetting } from "../../constants";
import { Collapse } from "@blueprintjs/core";
import { DevSettings } from "../../account/dev/dev_support";

export enum ColWidth {
  label = 3,
  description = 7,
  button = 2
}

export const FarmBotSettings = (props: FarmbotSettingsProps) => {
  const {
    dispatch, device, shouldDisplay, timeSettings, sourceFbosConfig,
    botOnline,
  } = props;
  const commonProps = { dispatch };
  return <Highlight className={"section"}
    settingName={DeviceSetting.farmbot}>
    {DevSettings.futureFeaturesEnabled() &&
      <Header {...commonProps}
        title={DeviceSetting.farmbot}
        panel={"farmbot_os"}
        dispatch={dispatch}
        expanded={props.bot.controlPanelState.farmbot_os} />}
    <Collapse isOpen={!!props.bot.controlPanelState.farmbot_os}>
      <NameRow {...commonProps} device={device} />
      <TimezoneRow {...commonProps} device={device} />
      <CameraSelection {...commonProps}
        env={props.env}
        botOnline={botOnline}
        saveFarmwareEnv={props.saveFarmwareEnv}
        shouldDisplay={shouldDisplay} />
      <OtaTimeSelectorRow {...commonProps}
        timeSettings={timeSettings}
        device={device}
        sourceFbosConfig={sourceFbosConfig} />
      <AutoUpdateRow {...commonProps}
        sourceFbosConfig={sourceFbosConfig} />
      <FarmbotOsRow {...commonProps}
        bot={props.bot}
        sourceFbosConfig={sourceFbosConfig}
        shouldDisplay={shouldDisplay}
        botOnline={botOnline}
        timeSettings={timeSettings}
        deviceAccount={device} />
      <AutoSyncRow {...commonProps}
        sourceFbosConfig={sourceFbosConfig} />
      {shouldDisplay(Feature.boot_sequence) && <BootSequenceSelector />}
    </Collapse>
  </Highlight>;
};

export class FarmbotOsSettings
  extends React.Component<FarmbotOsProps, {}> {
  render() {
    const { bot, sourceFbosConfig } = this.props;
    const botOnline = isBotOnlineFromState(bot);
    return <Widget className="device-widget">
      <WidgetHeader title="Device">
      </WidgetHeader>
      <WidgetBody>
        <FarmBotSettings
          bot={bot}
          env={this.props.env}
          alerts={this.props.alerts}
          saveFarmwareEnv={this.props.saveFarmwareEnv}
          dispatch={this.props.dispatch}
          sourceFbosConfig={sourceFbosConfig}
          shouldDisplay={this.props.shouldDisplay}
          botOnline={botOnline}
          timeSettings={this.props.timeSettings}
          device={this.props.deviceAccount} />
        <Firmware
          bot={this.props.bot}
          alerts={this.props.alerts}
          dispatch={this.props.dispatch}
          sourceFbosConfig={sourceFbosConfig}
          shouldDisplay={this.props.shouldDisplay}
          botOnline={botOnline}
          timeSettings={this.props.timeSettings} />
        <PowerAndReset
          controlPanelState={this.props.bot.controlPanelState}
          dispatch={this.props.dispatch}
          sourceFbosConfig={sourceFbosConfig}
          botOnline={botOnline} />
      </WidgetBody>
    </Widget>;
  }
}
