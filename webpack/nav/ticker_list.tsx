import * as React from "react";
import { Collapse } from "@blueprintjs/core";
import { Markdown } from "../ui/index";
import { TickerListProps } from "./interfaces";
import { t } from "i18next";
import { formatLogTime } from "../logs/index";
import { safeNumericSetting } from "../session";
import { ErrorBoundary } from "../error_boundary";
import { ALLOWED_MESSAGE_TYPES, TaggedLog, SpecialStatus } from "farmbot";
import { filterByVerbosity } from "../logs/components/logs_table";
import { isNumber } from "lodash";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { Link } from "../link";

/** Get current verbosity filter level for a message type from WebAppConfig. */
const getFilterLevel = (getConfigValue: GetWebAppConfigValue) =>
  (type: ALLOWED_MESSAGE_TYPES): number => {
    const filterLevel =
      getConfigValue(safeNumericSetting(type + "_log"));
    return isNumber(filterLevel) ? filterLevel : 1;
  };

/** Generate a fallback TaggedLog to display in the first line of the ticker. */
const generateFallbackLog = (uuid: string, message: string): TaggedLog => {
  return {
    kind: "Log",
    uuid,
    specialStatus: SpecialStatus.SAVED,
    body: {
      message,
      type: "debug",
      verbosity: -1,
      channels: [], created_at: NaN
    }
  };
};

/** Choose the log to display in the first line of the ticker. */
const getfirstTickerLog = (getConfigValue: GetWebAppConfigValue) =>
  (logs: TaggedLog[]): TaggedLog => {
    if (logs.length == 0) {
      return generateFallbackLog("no_logs_yet", t("No logs yet."));
    } else {
      const filteredLogs =
        filterByVerbosity(getFilterLevel(getConfigValue), logs);
      if (filteredLogs.length > 0) {
        return filteredLogs[0];
      } else {
        return generateFallbackLog("no_logs_to_display",
          t("No logs to display. Visit Logs page to view filters."));
      }
    }
  };

/** Format a single log for display in the ticker. */
const Ticker = (log: TaggedLog, timeOffset: number) => {
  const { message, type, created_at } = log.body;
  const time = formatLogTime(created_at || NaN, timeOffset);
  return <div key={log.uuid} className="status-ticker-wrapper">
    <div className={`saucer ${type}`} />
    <label className="status-ticker-message">
      <Markdown>
        {message.replace(/\s+/g, " ") || t("Loading")}
      </Markdown>
    </label>
    <label className="status-ticker-created-at">
      {t(time)}
    </label>
  </div>;
};

/** The logs ticker, with closed/open views, and a link to the Logs page. */
export let TickerList = (props: TickerListProps) => {
  return <ErrorBoundary>
    <div className="ticker-list" onClick={props.toggle("tickerListOpen")} >
      <div className="first-ticker">
        {Ticker(getfirstTickerLog(props.getConfigValue)(props.logs),
          props.timeOffset)}
      </div>
      <Collapse isOpen={props.tickerListOpen}>
        {filterByVerbosity(getFilterLevel(props.getConfigValue), props.logs)
          // Don't use first log again since it's already displayed in first row
          .filter((_, index) => index !== 0)
          .map((log: TaggedLog) => Ticker(log, props.timeOffset))}
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
