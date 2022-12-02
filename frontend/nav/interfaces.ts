import { BotState } from "../devices/interfaces";
import {
  TaggedUser, TaggedLog, TaggedDevice, Alert, FirmwareHardware,
  TaggedWizardStepResult,
  TaggedTelemetry,
} from "farmbot";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { MetricPanelState, TimeSettings } from "../interfaces";
import { PingDictionary } from "../devices/connectivity/qos";
import { HelpState } from "../help/reducer";

export interface NavBarProps {
  logs: TaggedLog[];
  bot: BotState;
  user: TaggedUser | undefined;
  dispatch: Function;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  device: TaggedDevice;
  alertCount: number;
  pings: PingDictionary;
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  authAud: string | undefined;
  wizardStepResults: TaggedWizardStepResult[];
  helpState: HelpState;
  telemetry: TaggedTelemetry[];
  metricPanelState: MetricPanelState;
}

export interface NavBarState {
  mobileMenuOpen: boolean;
  tickerListOpen: boolean;
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
  tickerListOpen: boolean;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  botOnline: boolean;
  lastSeen: number;
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
