import * as React from "react";
import { Collapse } from "@blueprintjs/core";
import { Markdown } from "../ui/index";
import { Log } from "../interfaces";
import { TickerListProps } from "./interfaces";
import { Link } from "react-router";
import { t } from "i18next";
import { formatLogTime } from "../logs/index";
import { Session, safeNumericSetting } from "../session";
import { isNumber } from "lodash";
import { ErrorBoundary } from "../error_boundary";

const logFilter = (log: Log): Log | undefined => {
  const { type, verbosity } = log;
  const filterLevel = Session.deprecatedGetNum(safeNumericSetting(type + "_log"));
  const filterLevelCompare = isNumber(filterLevel) ? filterLevel : 1;
  const displayLog = verbosity
    ? verbosity <= filterLevelCompare
    : filterLevel != 0;
  const whitelisted = !log.message.toLowerCase().includes("filtered");
  if (displayLog && whitelisted) {
    return log;
  }
  return;
};

const getfirstTickerLog = (logs: Log[]): Log => {
  if (logs.length == 0) {
    return {
      message: t("No logs yet."),
      type: "debug",
      verbosity: -1,
      channels: [], created_at: NaN
    };
  } else {
    const filteredLogs = logs.filter(log => logFilter(log));
    if (filteredLogs.length > 0) {
      return filteredLogs[0];
    } else {
      return {
        message: t("No logs to display. Visit Logs page to view filters."),
        type: "debug",
        verbosity: -1,
        channels: [], created_at: NaN
      };
    }
  }
};

const Ticker = (log: Log, index: number, timeOffset: number) => {
  const time = formatLogTime(log.created_at, timeOffset);
  const { type } = log;
  // TODO: Should utilize log's `uuid` instead of index.
  return <div key={index} className="status-ticker-wrapper">
    <div className={`saucer ${type}`} />
    <label className="status-ticker-message">
      <Markdown>
        {log.message.replace(/\s+/g, " ") || "Loading"}
      </Markdown>
    </label>
    <label className="status-ticker-created-at">
      {time}
    </label>
  </div>;
};

export let TickerList = (props: TickerListProps) => {
  return <ErrorBoundary>
    <div className="ticker-list" onClick={props.toggle("tickerListOpen")} >
      <div className="first-ticker">
        {Ticker(getfirstTickerLog(props.logs), -1, props.timeOffset)}
      </div>
      <Collapse isOpen={props.tickerListOpen}>
        {props
          .logs
          .filter((_, index) => index !== 0)
          .filter((log) => logFilter(log))
          .map((log: Log, index: number) => Ticker(log, index, props.timeOffset))}
      </Collapse>
      <Collapse isOpen={props.tickerListOpen}>
        <Link to={"/app/logs"}>
          <div className="logs-page-link">
            <label>
              {t("Filter logs")}
            </label>
          </div>
        </Link>
      </Collapse>
    </div>
  </ErrorBoundary>;
};
