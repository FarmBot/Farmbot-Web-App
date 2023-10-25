import {
  BotState, SourceFbosConfig, SourceFwConfig, UserEnv,
} from "../devices/interfaces";
import {
  TaggedUser, TaggedLog, TaggedDevice, Alert, FirmwareHardware,
  TaggedWizardStepResult,
  TaggedTelemetry,
  TaggedPeripheral,
  TaggedSequence,
  TaggedWebcamFeed,
} from "farmbot";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { TimeSettings } from "../interfaces";
import { PingDictionary } from "../devices/connectivity/qos";
import { HelpState } from "../help/reducer";
import { AppState } from "../reducer";
import { ResourceIndex } from "../resources/interfaces";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { RunButtonMenuOpen } from "../sequences/interfaces";

export interface NavBarProps {
  logs: TaggedLog[];
  bot: BotState;
  user: TaggedUser | undefined;
  dispatch: Function;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  sourceFwConfig: SourceFwConfig;
  sourceFbosConfig: SourceFbosConfig;
  firmwareConfig: FirmwareConfig | undefined;
  resources: ResourceIndex;
  device: TaggedDevice;
  alertCount: number;
  pings: PingDictionary;
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  authAud: string | undefined;
  wizardStepResults: TaggedWizardStepResult[];
  helpState: HelpState;
  telemetry: TaggedTelemetry[];
  appState: AppState;
  menuOpen: RunButtonMenuOpen;
  env: UserEnv;
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  sequences: TaggedSequence[];
}

export interface NavBarState {
  mobileMenuOpen: boolean;
  accountMenuOpen: boolean;
  documentTitle: string;
}

type ToggleEventHandler = (e: React.MouseEvent<HTMLElement>) => void;

export interface MobileMenuProps {
  close: (property: keyof NavBarState) => ToggleEventHandler;
  mobileMenuOpen: boolean;
  alertCount: number;
  helpState: HelpState;
}

export interface TickerListProps {
  toggle: (property: keyof NavBarState) => ToggleEventHandler;
  logs: TaggedLog[]
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  botOnline: boolean;
  lastSeen: number;
  dispatch: Function;
}

export interface NavLinksProps {
  close: (property: keyof NavBarState) => ToggleEventHandler;
  alertCount: number;
  helpState: HelpState;
}

export interface AccountMenuProps {
  isStaff: boolean;
  close: (property: keyof NavBarState) => ToggleEventHandler;
}

export interface EStopButtonProps {
  bot: BotState;
  forceUnlock: boolean;
}
