import * as React from "react";
import { t } from "i18next";
import { TaggedLog } from "../../resources/tagged_resources";
import { LogsState, LogsTableProps } from "../interfaces";
import { formatLogTime } from "../index";
import * as _ from "lodash";

const LogsRow = (tlog: TaggedLog, state: LogsState) => {
  const log = tlog.body;
  const time = formatLogTime(log.created_at);
  const type = (log.meta || {}).type;
  const filtered = state[type as keyof LogsState];
  const displayLog = _.isUndefined(filtered) || filtered;
  const { x, y, z } = log.meta;
  return displayLog ?
    <tr key={tlog.uuid}>
      <td>
        <div className={`saucer ${type}`} />
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
    </tr> : undefined;
};

export const LogsTable = (props: LogsTableProps) => {
  return <table className="pt-table pt-striped logs-table">
    <thead>
      <tr>
        <th><label>{t("Type")}</label></th>
        <th><label>{t("Message")}</label></th>
        <th><label>{t("Position (x, y, z)")}</label></th>
        <th><label>{t("Time")}</label></th>
      </tr>
    </thead>
    <tbody>
      {props.logs.map((log: TaggedLog) => {
        const isFiltered = log.body.message.toLowerCase().includes("filtered");
        if (!isFiltered) { return LogsRow(log, props.state); }
      })}
    </tbody>
  </table>;
};
