import * as React from "react";
import { MCUFactoryReset, bulkToggleControlPanel } from "../actions";
import { Widget, WidgetHeader, WidgetBody, Color } from "../../ui/index";
import { HardwareSettingsProps, SourceFwConfig } from "../interfaces";
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
import type { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import type { McuParamName } from "farmbot";

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
      <WidgetHeader title={t("Hardware")} helpText={ToolTips.HW_SETTINGS}>
        <SettingLoadProgress firmwareConfig={firmwareConfig}
          sourceFwConfig={sourceFwConfig} />
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
          resources={resources}
          firmwareHardware={firmwareHardware} />
      </WidgetBody>
    </Widget>;
  }
}

interface SettingLoadProgressProps {
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
}

const UNTRACKED_KEYS: (keyof FirmwareConfig)[] = [
  "id", "created_at", "updated_at", "device_id", "api_migrated",
  "param_config_ok", "param_test", "param_use_eeprom", "param_version",
];

/** Track firmware configuration adoption by FarmBot OS. */
const SettingLoadProgress = (props: SettingLoadProgressProps) => {
  const keys = Object.keys(props.firmwareConfig || {})
    .filter((k: keyof FirmwareConfig) => !UNTRACKED_KEYS.includes(k));
  const loadedKeys = keys.filter((key: McuParamName) =>
    props.sourceFwConfig(key).consistent);
  const progress = loadedKeys.length / keys.length * 100;
  const color = [0, 100].includes(progress) ? Color.darkGray : Color.white;
  return <div className={"load-progress-bar-wrapper"}>
    <div className={"load-progress-bar"}
      style={{ width: `${progress}%`, background: color }} />
  </div>;
};
