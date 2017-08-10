import { BotState } from "../devices/interfaces";
import { Log } from "../interfaces";
import { TaggedUser } from "../resources/tagged_resources";

export interface NavButtonProps {
  user: TaggedUser | undefined;
  dispatch: Function;
  bot: BotState;
  onClick?: () => void;
}

export interface NavBarProps {
  logs: Log[];
  bot: BotState;
  user: TaggedUser | undefined;
  dispatch: Function;
}

export interface NavBarState {
  mobileMenuOpen: boolean;
  tickerListOpen: boolean;
}

type ToggleEventHandler = (e: React.MouseEvent<HTMLDivElement>) => void;

export interface MobileMenuProps {
  toggle: (property: keyof NavBarState) => ToggleEventHandler;
  mobileMenuOpen: boolean;
}

export interface TickerListProps {
  toggle: (property: keyof NavBarState) => ToggleEventHandler;
  logs: Log[]
  tickerListOpen: boolean;
}
