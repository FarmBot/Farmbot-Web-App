import {
  BotState,
  ControlPanelState,
  SourceFbosConfig,
} from "../../devices/interfaces";
import { InformationalSettings, TaggedDevice } from "farmbot";
import { TimeSettings } from "../../interfaces";

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

export interface AutoUpdateRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface OtaTimeSelectorProps {
  disabled: boolean;
  timeSettings: TimeSettings;
  device: TaggedDevice;
  dispatch: Function;
}

export interface OtaTimeSelectorRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  device: TaggedDevice;
  timeSettings: TimeSettings;
}

export interface PowerAndResetProps {
  controlPanelState: ControlPanelState;
  dispatch: Function;
  botOnline: boolean;
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
}

export interface FarmbotOsRowState {
  version: string | undefined;
  channel: string | undefined;
}

export interface FbosDetailsProps {
  botInfoSettings: InformationalSettings;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botToMqttLastSeen: number;
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
