import { BotState, SourceFbosConfig } from "../../devices/interfaces";
import { Alert, TaggedDevice } from "farmbot";
import { SettingsPanelState, TimeSettings } from "../../interfaces";

export interface FarmbotSettingsProps {
  bot: BotState;
  alerts: Alert[];
  device: TaggedDevice;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  timeSettings: TimeSettings;
  botOnline: boolean;
  settingsPanelState: SettingsPanelState;
  showAdvanced: boolean;
}

export interface NameRowProps {
  dispatch: Function;
  device: TaggedDevice;
  widget?: boolean;
}

export interface OrderNumberRowProps {
  dispatch: Function;
  device: TaggedDevice;
}

export interface TimezoneRowProps {
  dispatch: Function;
  device: TaggedDevice;
}

export interface GardenLocationRowProps {
  dispatch: Function;
  device: TaggedDevice;
}

export interface AutoUpdateRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface OtaTimeSelectorProps {
  timeSettings: TimeSettings;
  device: TaggedDevice;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface OtaTimeSelectorRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  device: TaggedDevice;
  timeSettings: TimeSettings;
  showAdvanced: boolean;
}

export interface PowerAndResetProps {
  settingsPanelState: SettingsPanelState;
  dispatch: Function;
  botOnline: boolean;
  showAdvanced: boolean;
}

export interface FactoryResetRowsProps {
  botOnline: boolean;
}

export interface FarmbotOsRowProps {
  bot: BotState;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botOnline: boolean;
  timeSettings: TimeSettings;
  device: TaggedDevice;
  showAdvanced: boolean;
}

export interface FarmbotOsRowState {
  version: string | undefined;
  channel: string | undefined;
}

export interface FbosDetailsProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  bot: BotState;
  timeSettings: TimeSettings;
  deviceAccount: TaggedDevice;
}

export interface OsUpdateButtonProps {
  bot: BotState;
  botOnline: boolean;
  dispatch: Function;
}

export interface ZHeightInputProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}
