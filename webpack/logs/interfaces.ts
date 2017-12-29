import { TaggedLog } from "../resources/tagged_resources";
import { BotState } from "../devices/interfaces";
import { ConfigurationName } from "farmbot";

export interface LogsProps {
  logs: TaggedLog[];
  bot: BotState;
  timeOffset: number;
}

export interface Filters {
  success: number;
  busy: number;
  warn: number;
  error: number;
  info: number;
  fun: number;
  debug: number;
}

export interface LogsState extends Filters {
  autoscroll: boolean;
}

export interface LogsTableProps {
  logs: TaggedLog[];
  state: LogsState;
  timeOffset: number;
}

type ToggleEventHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;
type SetNumSetting = (property: keyof LogsState) => (value: number) => void;

export interface LogsFilterMenuProps {
  toggle: (property: keyof LogsState) => ToggleEventHandler;
  state: LogsState;
  setFilterLevel: SetNumSetting;
}

export interface LogSettingProps {
  label: string;
  setting: ConfigurationName;
  toolTip: string;
  value: boolean | number | undefined;
  setFilterLevel: SetNumSetting;
}

export interface LogsSettingsMenuProps {
  bot: BotState;
  setFilterLevel: SetNumSetting;
}
