import { Log } from "../interfaces";

export interface LogsProps {
  logs: Log[]
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
  logs: Log[];
  state: LogsState;
}

type ToggleEventHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

export interface LogsFilterMenuProps {
  toggle: (property: keyof LogsState) => ToggleEventHandler;
  state: LogsState;
}
