import { TaggedLog } from "../resources/tagged_resources";
import { BotState } from "../devices/interfaces";
import { ConfigurationName } from "farmbot";

export interface LogsProps {
  logs: TaggedLog[];
  bot: BotState;
}

export interface Filters {
  success: boolean;
  busy: boolean;
  warn: boolean;
  error: boolean;
  info: boolean;
  fun: boolean;
  debug: boolean;
}

export interface LogsState extends Filters {
  autoscroll: boolean;
}

export interface LogsTableProps {
  logs: TaggedLog[];
  state: LogsState;
}

type ToggleEventHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

export interface LogsFilterMenuProps {
  toggle: (property: keyof LogsState) => ToggleEventHandler;
  state: LogsState;
}

export interface LogSettingProps {
  label: string;
  setting: ConfigurationName;
  toolTip: string;
  value: boolean | undefined;
}
