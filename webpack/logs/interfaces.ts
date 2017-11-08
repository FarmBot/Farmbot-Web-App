import { Log } from "../interfaces";

export interface LogsProps {
  logs: Log[]
}

export interface LogsState {
  autoscroll: boolean;
  success: boolean;
  busy: boolean;
  warn: boolean;
  error: boolean;
  info: boolean;
  fun: boolean;
  debug: boolean;
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
