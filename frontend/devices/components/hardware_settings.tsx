import * as React from "react";
import { MCUFactoryReset, bulkToggleControlPanel } from "../actions";
import { Widget, WidgetHeader, WidgetBody, Color } from "../../ui/index";
import { HardwareSettingsProps, SourceFwConfig } from "../interfaces";
import { isBotOnlineFromState } from "../must_be_online";
import { ToolTips } from "../../constants";
import { DangerZone } from "./hardware_settings/danger_zone";
import { PinGuard } from "./hardware_settings/pin_guard";
import { Encoders } from "./hardware_settings/encoders";
import { EndStops } from "./hardware_settings/endstops";
import { Motors } from "./hardware_settings/motors";
import {
  HomingAndCalibration,
} from "./hardware_settings/homing_and_calibration";
import { Popover, Position } from "@blueprintjs/core";
import { FwParamExportMenu } from "./hardware_settings/export_menu";
import { t } from "../../i18next_wrapper";
import { PinBindings } from "./hardware_settings/pin_bindings";
import { ErrorHandling } from "./hardware_settings/error_handling";
import type { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import type { McuParamName } from "farmbot";

export class HardwareSettings extends
  React.Component<HardwareSettingsProps, {}> {

  render() {
    const {
      bot, dispatch, sourceFwConfig, controlPanelState, firmwareConfig,
      firmwareHardware, resources
    } = this.props;
    const botOnline = isBotOnlineFromState(bot);
    const { busy } = bot.hardware.informational_settings;
    const commonProps = { dispatch, controlPanelState };
    return <Widget className="hardware-widget">
      <WidgetHeader title={t("Hardware")} helpText={ToolTips.HW_SETTINGS}>
        <SettingLoadProgress firmwareConfig={firmwareConfig}
          sourceFwConfig={sourceFwConfig} />
      </WidgetHeader>
      <WidgetBody>
        <button
          className={"fb-button gray no-float"}
          title={t("Expand All")}
          onClick={() => dispatch(bulkToggleControlPanel(true))}>
          {t("Expand All")}
        </button>
        <button
          className={"fb-button gray no-float"}
          title={t("Collapse All")}
          onClick={() => dispatch(bulkToggleControlPanel(false))}>
          {t("Collapse All")}
        </button>
        <Popover position={Position.BOTTOM_RIGHT}>
          <i className="fa fa-download" />
          <FwParamExportMenu firmwareConfig={firmwareConfig} />
        </Popover>
        <HomingAndCalibration {...commonProps}
          bot={bot}
          sourceFwConfig={sourceFwConfig}
          shouldDisplay={this.props.shouldDisplay}
          firmwareConfig={firmwareConfig}
          firmwareHardware={firmwareHardware}
          botOnline={botOnline} />
        <Motors {...commonProps}
          arduinoBusy={busy}
          sourceFwConfig={sourceFwConfig}
          firmwareHardware={firmwareHardware} />
        <Encoders {...commonProps}
          arduinoBusy={busy}
          sourceFwConfig={sourceFwConfig}
          shouldDisplay={this.props.shouldDisplay}
          firmwareHardware={firmwareHardware} />
        <EndStops {...commonProps}
          arduinoBusy={busy}
          sourceFwConfig={sourceFwConfig} />
        <ErrorHandling {...commonProps}
          arduinoBusy={busy}
          sourceFwConfig={sourceFwConfig} />
        <PinBindings  {...commonProps}
          resources={resources}
          firmwareHardware={firmwareHardware} />
        <PinGuard {...commonProps}
          arduinoBusy={busy}
          resources={resources}
          sourceFwConfig={sourceFwConfig} />
        <DangerZone {...commonProps}
          arduinoBusy={busy}
          onReset={MCUFactoryReset}
          botOnline={botOnline} />
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
