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
}

export interface MobileMenuProps {
  toggle: (property: keyof NavBarState) => any;
  mobileMenuOpen: boolean;
}
