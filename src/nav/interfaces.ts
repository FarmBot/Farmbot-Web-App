import { BotState } from "../devices/interfaces";
import { Log } from "../interfaces";
import { TaggedUser } from "../resources/tagged_resources";

export interface NavButtonProps {
  user: TaggedUser | undefined;
  dispatch: Function;
  bot: BotState;
  onClick?: () => void;
}

export interface DropDownProps {
  user: TaggedUser | undefined;
  onClick?: () => void;
}

export interface NavBarState {
  mobileNavExpanded?: boolean;
  tickerExpanded?: boolean;
}

export interface NavBarProps {
  logs: Log[];
  bot: BotState;
  user: TaggedUser | undefined;
  dispatch: Function;
}
