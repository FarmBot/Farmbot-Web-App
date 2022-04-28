import React from "react";
import moment from "moment";
import { t } from "../../i18next_wrapper";
import { TaggedLog, ALLOWED_MESSAGE_TYPES } from "farmbot";
import { LogsState, LogsTableProps, Filters } from "../interfaces";
import { Classes } from "@blueprintjs/core";
import { isNumber, startCase, some } from "lodash";
import { TimeSettings } from "../../interfaces";
import { UUID } from "../../resources/interfaces";
import { Markdown } from "../../ui";
import { semverCompare, SemverResult, formatTime } from "../../util";
import { destroy } from "../../api/crud";

interface LogsRowProps {
  tlog: TaggedLog;
  dispatch: Function;
  markdown: boolean;
  timeSettings: TimeSettings;
  fbosVersion: string | undefined;
}

export const logVersionMatch =
  (log: TaggedLog, fbosVersion: string | undefined) => {
    const { major_version, minor_version, patch_version } = log.body;
    const logVersionString = [
      major_version,
      minor_version,
      patch_version,
    ].join(".");
    return semverCompare(logVersionString, (fbosVersion || "").split("-")[0])
      == SemverResult.EQUAL;
  };

export const xyzTableEntry =
  (x: number | undefined, y: number | undefined, z: number | undefined) =>
    (isNumber(x) && isNumber(y) && isNumber(z))
      ? `(${x}, ${y}, ${z})`
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
        {(props.verbosity || 0) < 1 ? "" : props.verbosity}
      </p>
    </div>
  </div>;

/** A log is displayed in a single row of the logs table. */
const LogsRow = (props: LogsRowProps) => {
  const { tlog, timeSettings, dispatch, markdown } = props;
  const { uuid } = tlog;
  const { x, y, z, verbosity, type, created_at, message, id } = tlog.body;
  const time = formatTime(moment.unix(created_at || NaN), timeSettings, "MMM D");
  return <tr key={uuid} id={"" + id}>
    <td>
      <LogVerbositySaucer
        uuid={uuid} dispatch={dispatch} verbosity={verbosity} type={type} />
      {t(startCase(type))}
    </td>
    <td>
      {markdown ? <Markdown>{message}</Markdown> : message || t("Loading")}
    </td>
    <td>
      {xyzTableEntry(x, y, z)}
    </td>
    <td>
      {time.toLowerCase().includes("invalid") ? t("Unknown") : time}
      {!logVersionMatch(tlog, props.fbosVersion) &&
        <i className={"fa fa-exclamation-triangle"}
          style={{ color: "gray", marginLeft: "0.5rem" }}
          title={t("Log not sent by current version of FarmBot OS.")} />}
      <i className={"fa fa-trash"} title={t("delete log")}
        onClick={() => dispatch(destroy(uuid))} />
    </td>
  </tr>;
};

const LOG_TABLE_CLASS = [
  Classes.HTML_TABLE,
  Classes.HTML_TABLE_STRIPED,
  "logs-table",
].join(" ");

/** All log messages with select data in table form for display in the app. */
export const LogsTable = (props: LogsTableProps) => {
  return <div className={"table-responsive"}>
    <table className={LOG_TABLE_CLASS}>
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
          .filter(bySearchTerm(props.state.searchTerm, props.timeSettings))
          .filter(log => !props.state.currentFbosOnly || !props.fbosVersion ||
            logVersionMatch(log, props.fbosVersion))
          .map((log: TaggedLog) =>
            <LogsRow
              key={log.uuid}
              tlog={log}
              dispatch={props.dispatch}
              markdown={props.state.markdown}
              fbosVersion={props.fbosVersion}
              timeSettings={props.timeSettings} />)}
      </tbody>
    </table>
  </div>;
};

/** Get current verbosity filter level for a message type from LogsState. */
const getFilterLevel = (state: LogsState) =>
  (type: keyof Filters): number => {
    const filterLevel = state[type];
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

export const bySearchTerm =
  (searchTerm: string, timeSettings: TimeSettings) =>
    (log: TaggedLog) => {
      const { x, y, z, created_at, message, type } = log.body;
      const displayedTime =
        formatTime(moment.unix(created_at || NaN), timeSettings, "MMM D");
      const displayedPosition = xyzTableEntry(x, y, z);
      const lowerSearchTerm = searchTerm.toLowerCase();
      return some([message, type]
        .map(string => string.toLowerCase().includes(lowerSearchTerm))
        .concat([
          displayedTime.toLowerCase().includes(lowerSearchTerm),
          displayedPosition.includes(lowerSearchTerm),
        ]));
    };
