import React from "react";
import moment from "moment";
import { Collapse } from "@blueprintjs/core";
import { Markdown } from "../ui";
import { TickerListProps } from "./interfaces";
import { safeNumericSetting } from "../session";
import { ErrorBoundary } from "../error_boundary";
import { ALLOWED_MESSAGE_TYPES, TaggedLog, SpecialStatus } from "farmbot";
import { filterByVerbosity } from "../logs/components/logs_table";
import { isNumber } from "lodash";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { Link } from "../link";
import { MessageType } from "../sequences/interfaces";
import { t } from "../i18next_wrapper";
import { TimeSettings } from "../interfaces";
import { forceOnline } from "../devices/must_be_online";
import { formatTime } from "../util";
import { Path } from "../internal_urls";

/** Get current verbosity filter level for a message type from WebAppConfig. */
const getFilterLevel = (getConfigValue: GetWebAppConfigValue) =>
  (type: ALLOWED_MESSAGE_TYPES): number => {
    const filterLevel =
      getConfigValue(safeNumericSetting(type + "_log"));
    return isNumber(filterLevel) ? filterLevel : 1;
  };

/** Generate a fallback TaggedLog to display in the first line of the ticker. */
const generateFallbackLog = (
  uuid: string, message: string, lastSeen?: number, type = MessageType.debug,
): TaggedLog => ({
  kind: "Log",
  uuid,
  specialStatus: SpecialStatus.SAVED,
  body: {
    message,
    type,
    verbosity: -1,
    channels: [],
    created_at: lastSeen ? moment(lastSeen).unix() : 0,
  }
});

export const demoAccountLog = () =>
  generateFallbackLog("demo", t("Using a demo account"), undefined,
    MessageType.info);

/** Choose the log to display in the first line of the ticker. */
const getFirstTickerLog = (
  getConfigValue: GetWebAppConfigValue,
  logs: TaggedLog[],
  botOnline: boolean,
  lastSeen: number,
): TaggedLog => {
  if (forceOnline()) {
    return demoAccountLog();
  }
  if (!botOnline) {
    return generateFallbackLog("bot_offline", t("FarmBot is offline"), lastSeen);
  }
  if (logs.length == 0) {
    return generateFallbackLog("no_logs_yet", t("No logs yet."));
  }
  const filteredLogs =
    filterByVerbosity(getFilterLevel(getConfigValue), logs);
  if (filteredLogs.length > 0) {
    return filteredLogs[0];
  }
  return generateFallbackLog("no_logs_to_display",
    t("No logs to display. Visit Logs page to view filters."));
};

interface TickerLogProps {
  log: TaggedLog;
  timeSettings: TimeSettings;
  prefix?: string;
}

/** Format a single log for display in the ticker. */
const TickerLog = (props: TickerLogProps) => {
  const { prefix, timeSettings } = props;
  const { message, type, created_at } = props.log.body;
  const time = created_at
    ? formatTime(moment.unix(created_at), timeSettings, "MMM D")
    : "";
  return <div className="status-ticker-wrapper">
    <div className={`saucer ${type}`} />
    <label className={`status-ticker-message ${prefix ? "prefix" : ""}`}>
      <Markdown>
        {message.replace(/\s+/g, " ") || t("Loading")}
      </Markdown>
    </label>
    <label className="status-ticker-created-at">
      {(prefix || "") + t(time).toUpperCase()}
    </label>
  </div>;
};

/** The logs ticker, with closed/open views, and a link to the Logs page. */
export const TickerList = (props: TickerListProps) => {
  const {
    tickerListOpen, logs, getConfigValue, timeSettings, botOnline, lastSeen,
  } = props;
  const firstTickerLog =
    getFirstTickerLog(getConfigValue, logs, botOnline, lastSeen);
  return <ErrorBoundary>
    <div className="ticker-list" onClick={props.toggle("tickerListOpen")}>
      <div className="first-ticker">
        <TickerLog log={firstTickerLog} timeSettings={timeSettings}
          prefix={!botOnline && firstTickerLog.body.created_at
            ? t("Last seen") + " "
            : ""} />
      </div>
      <Collapse isOpen={tickerListOpen}>
        {filterByVerbosity(getFilterLevel(getConfigValue), logs)
          // Don't use first log again when it's already displayed in first row
          .filter((_, index) => forceOnline() || !botOnline || index !== 0)
          .map((log: TaggedLog) =>
            <TickerLog key={log.uuid} log={log} timeSettings={timeSettings} />)}
      </Collapse>
      <Collapse isOpen={tickerListOpen}>
        <Link to={Path.logs()}>
          <div className="logs-page-link">
            <label>
              {t("View all logs")}
            </label>
          </div>
        </Link>
      </Collapse>
    </div>
  </ErrorBoundary>;
};
