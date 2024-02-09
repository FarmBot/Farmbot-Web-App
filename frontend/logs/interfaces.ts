import {
  TaggedLog, ConfigurationName, ALLOWED_MESSAGE_TYPES, TaggedDevice,
} from "farmbot";
import { SourceFbosConfig, BotState } from "../devices/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { TimeSettings } from "../interfaces";

export interface LogsPanelProps {
  dispatch: Function;
}

export interface LogsProps {
  logs: TaggedLog[];
  timeSettings: TimeSettings;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  getConfigValue: GetWebAppConfigValue;
  bot: BotState;
  fbosVersion: string | undefined;
  device: TaggedDevice;
}

export type Filters = Record<ALLOWED_MESSAGE_TYPES, number>;

export interface LogsState extends Filters {
  autoscroll: boolean;
  searchTerm: string;
  markdown: boolean;
  currentFbosOnly: boolean;
}

export interface FilterPopoverProps extends LogsFilterMenuProps {
  filterActive: boolean;
}

export interface LogsTableProps extends FilterPopoverProps {
  logs: TaggedLog[];
  dispatch: Function;
  timeSettings: TimeSettings;
  fbosVersion: string | undefined;
  device: TaggedDevice;
}

type ToggleEventHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;
type SetNumSetting = (property: keyof LogsState) => (value: number) => void;

export interface LogsFilterMenuProps {
  toggle: (property: keyof LogsState) => ToggleEventHandler;
  state: LogsState;
  setFilterLevel: SetNumSetting;
  toggleCurrentFbosOnly(): void;
}

export interface LogSettingProps {
  label: string;
  setting: ConfigurationName;
  toolTip: string;
  setFilterLevel: SetNumSetting;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  getConfigValue: GetWebAppConfigValue;
}

export interface LogsSettingsMenuProps {
  setFilterLevel: SetNumSetting;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  getConfigValue: GetWebAppConfigValue;
  bot: BotState;
  markdown: boolean;
  toggleMarkdown(): void;
}
