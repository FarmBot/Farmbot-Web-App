import { BotState } from "../devices/interfaces";
import { TaggedUser, TaggedLog, TaggedDevice } from "farmbot";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { TimeSettings } from "../interfaces";

export interface SyncButtonProps {
  dispatch: Function;
  bot: BotState;
  consistent: boolean;
  onClick?: () => void;
  autoSync: boolean;
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
  autoSync: boolean;
  alertCount: number;
}

export interface NavBarState {
  mobileMenuOpen: boolean;
  tickerListOpen: boolean;
  accountMenuOpen: boolean;
}

type ToggleEventHandler = (e: React.MouseEvent<HTMLElement>) => void;

export interface MobileMenuProps {
  close: (property: keyof NavBarState) => ToggleEventHandler;
  mobileMenuOpen: boolean;
  alertCount: number;
}

export interface TickerListProps {
  toggle: (property: keyof NavBarState) => ToggleEventHandler;
  logs: TaggedLog[]
  tickerListOpen: boolean;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
}

export interface NavLinksProps {
  close: (property: keyof NavBarState) => ToggleEventHandler;
  alertCount: number;
}

export interface AccountMenuProps {
  close: (property: keyof NavBarState) => ToggleEventHandler;
  logout: () => void;
}
