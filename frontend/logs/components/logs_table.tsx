import * as React from "react";
import { TaggedLog, ALLOWED_MESSAGE_TYPES } from "farmbot";
import { LogsState, LogsTableProps, Filters } from "../interfaces";
import { formatLogTime } from "../index";
import { Classes } from "@blueprintjs/core";
import { isNumber, startCase } from "lodash";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { UUID } from "../../resources/interfaces";

interface LogsRowProps {
  tlog: TaggedLog;
  dispatch: Function;
  timeSettings: TimeSettings;
}

export const xyzTableEntry =
  (x: number | undefined, y: number | undefined, z: number | undefined) =>
    (isNumber(x) && isNumber(y) && isNumber(z))
      ? `${x}, ${y}, ${z}`
      : t("Unknown");

interface LogVerbositySaucerProps {
  uuid: UUID;
  verbosity: number | undefined;
  type: ALLOWED_MESSAGE_TYPES;
  dispatch: Function;
}

const LogVerbositySaucer = (props: LogVerbositySaucerProps) =>
  <div className="log-verbosity-saucer">
    <div className={`saucer ${props.type}`}>
      <p>
        {props.verbosity}
      </p>
    </div>
  </div>;

/** A log is displayed in a single row of the logs table. */
const LogsRow = ({ tlog, timeSettings, dispatch }: LogsRowProps) => {
  const { uuid } = tlog;
  const { x, y, z, verbosity, type, created_at, message, id } = tlog.body;
  const time = formatLogTime(created_at || NaN, timeSettings);
  return <tr key={uuid} id={"" + id}>
    <td>
      <LogVerbositySaucer
        uuid={uuid} dispatch={dispatch} verbosity={verbosity} type={type} />
      {t(startCase(type))}
    </td>
    <td>
      {message || t("Loading")}
    </td>
    <td>
      {xyzTableEntry(x, y, z)}
    </td>
    <td>
      {time}
    </td>
  </tr>;
};

const LOG_TABLE_CLASS = [
  Classes.HTML_TABLE,
  Classes.HTML_TABLE_STRIPED,
  "logs-table"
].join(" ");

/** All log messages with select data in table form for display in the app. */
export const LogsTable = (props: LogsTableProps) => {
  return <table className={LOG_TABLE_CLASS}>
    <thead>
      <tr>
        <th><label>{t("Type")}</label></th>
        <th><label>{t("Message")}</label></th>
        <th><label>{t("(x, y, z)")}</label></th>
        <th><label>{t("Time")}</label></th>
      </tr>
    </thead>
    <tbody>
      {filterByVerbosity(getFilterLevel(props.state), props.logs)
        .map((log: TaggedLog) =>
          <LogsRow
            key={log.uuid}
            tlog={log}
            dispatch={props.dispatch}
            timeSettings={props.timeSettings} />)}
    </tbody>
  </table>;
};

/** Get current verbosity filter level for a message type from LogsState. */
const getFilterLevel = (state: LogsState) =>
  (type: keyof Filters): number => {
    const filterLevel = state[type as keyof Filters];
    return isNumber(filterLevel) ? filterLevel : 1;
  };

/** Filter TaggedLogs by verbosity level using a fetch filter level function. */
export const filterByVerbosity =
  (getLevelFor: (type: keyof Filters) => number, logs: TaggedLog[]) => {
    return logs
      .filter((log: TaggedLog) => {
        const { type, verbosity } = log.body;
        const filterLevel = getLevelFor(type);
        // If verbosity is 0 (or == False), display if log type is enabled
        const displayLog = verbosity
          ? verbosity <= filterLevel
          : filterLevel != 0;
        return displayLog;
      });
  };
