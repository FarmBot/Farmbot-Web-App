import { BotState, SourceFbosConfig } from "../../devices/interfaces";
import { Alert, FirmwareHardware } from "farmbot";
import { SettingsPanelState, TimeSettings } from "../../interfaces";

export interface FirmwareProps {
  botOnline: boolean;
  bot: BotState;
  alerts: Alert[];
  dispatch: Function;
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
  settingsPanelState: SettingsPanelState;
  showAdvanced: boolean;
}

export interface FlashFirmwareRowProps {
  botOnline: boolean;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface BoardTypeProps {
  botOnline: boolean;
  bot: BotState;
  alerts: Alert[];
  dispatch: Function;
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
  firmwareHardware: FirmwareHardware | undefined;
}
