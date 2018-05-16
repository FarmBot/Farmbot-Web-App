import * as React from "react";
import { t } from "i18next";
import { TaggedLog } from "../../resources/tagged_resources";
import { LogsState, LogsTableProps } from "../interfaces";
import { formatLogTime } from "../index";
import * as _ from "lodash";
import { Classes } from "@blueprintjs/core";
interface LogsRowProps {
  tlog: TaggedLog;
  state: LogsState;
  timeOffset: number;
}
const LogsRow = ({ tlog, timeOffset }: LogsRowProps) => {
  const log = tlog.body;
  const { x, y, z, verbosity, type } = log;
  const time = formatLogTime(log.created_at, timeOffset);
  return <tr key={tlog.uuid}>
    <td>
      <div className={`saucer ${type}`}>
        <p>
          {verbosity}
        </p>
      </div>
      {_.startCase(type)}
    </td>
    <td>
      {log.message || "Loading"}
    </td>
    <td>
      {
        (_.isNumber(x) && _.isNumber(y) && _.isNumber(z))
          ? `${x}, ${y}, ${z}`
          : "Unknown"
      }
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

export const LogsTable = (props: LogsTableProps) => {
  return <table className={LOG_TABLE_CLASS}>
    <thead>
      <tr>
        <th><label>{t("Type")}</label></th>
        <th><label>{t("Message")}</label></th>
        <th><label>{t("Position (x, y, z)")}</label></th>
        <th><label>{t("Time")}</label></th>
      </tr>
    </thead>
    <tbody>
      {filterByVerbosity(props.state, props.logs)
        .map((log: TaggedLog) => {
          return <LogsRow
            key={log.uuid}
            tlog={log}
            state={props.state}
            timeOffset={props.timeOffset} />;
        })}
    </tbody>
  </table>;
};

const filterByVerbosity = (state: LogsState, logs: TaggedLog[]) => {
  return logs
    .filter((log: TaggedLog) => {
      return !log.body.message.toLowerCase().includes("filtered");
    })
    .filter((log: TaggedLog) => {
      const { type, verbosity } = log.body;
      const filterLevel = state[type as keyof LogsState];
      const displayLog = verbosity
        ? verbosity <= filterLevel
        : filterLevel != 0;
      return displayLog;
    });
};
