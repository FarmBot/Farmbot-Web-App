import { BotState } from "../devices/interfaces";
import {
  TaggedUser, TaggedLog, TaggedDevice, Alert, FirmwareHardware,
  TaggedWizardStepResult,
} from "farmbot";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { TimeSettings } from "../interfaces";
import { PingDictionary } from "../devices/connectivity/qos";
import { HelpState } from "../help/reducer";

export interface SyncButtonProps {
  dispatch: Function;
  bot: BotState;
  consistent: boolean;
  onClick?: () => void;
}

export interface NavBarProps {
  consistent: boolean;
  logs: TaggedLog[];
  bot: BotState;
  user: TaggedUser | undefined;
  dispatch: Function;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  tour: string | undefined;
  device: TaggedDevice;
  alertCount: number;
  pings: PingDictionary;
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  authAud: string | undefined;
  wizardStepResults: TaggedWizardStepResult[];
  helpState: HelpState;
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
}

export interface NavLinksProps {
  close: (property: keyof NavBarState) => ToggleEventHandler;
  alertCount: number;
  addMap?: boolean;
  helpState: HelpState;
}

export interface AccountMenuProps {
  close: (property: keyof NavBarState) => ToggleEventHandler;
  logout: () => void;
}
