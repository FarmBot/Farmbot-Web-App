import { TaggedLog, ConfigurationName, ALLOWED_MESSAGE_TYPES } from "farmbot";
import { SourceFbosConfig } from "../devices/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { Alert } from "./alerts";
import { TimeSettings } from "../interfaces";

export interface LogsProps {
  logs: TaggedLog[];
  timeSettings: TimeSettings;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  getConfigValue: GetWebAppConfigValue;
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
}

export type Filters = Record<ALLOWED_MESSAGE_TYPES, number>;

export interface LogsState extends Filters {
  autoscroll: boolean;
}

export interface LogsTableProps {
  logs: TaggedLog[];
  state: LogsState;
  timeSettings: TimeSettings;
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
}
