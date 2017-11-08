import * as React from "react";
import { Collapse } from "@blueprintjs/core";
import { Markdown } from "../ui/index";
import { Log } from "../interfaces";
import { TickerListProps } from "./interfaces";
import { Link } from "react-router";
import { t } from "i18next";
import { formatLogTime } from "../logs/index";

const Ticker = (log: Log, index: number) => {
  const time = formatLogTime(log.created_at);
  const type = (log.meta || {}).type;
  return (
    // TODO: Should utilize log's `uuid` instead of index.
    <div key={index} className="status-ticker-wrapper">
      <div className={`saucer ${type}`} />
      <label className="status-ticker-message">
        <Markdown>
          {log.message || "Loading"}
        </Markdown>
      </label>
      <label className="status-ticker-created-at">
        {time}
      </label>
    </div>
  );
};

export let TickerList = (props: TickerListProps) => {
  const firstTicker: Log = props.logs.filter(
    log => !log.message.toLowerCase().includes("filtered"))[0];
  const noLogs: Log = {
    message: "No logs yet.", meta: { type: "debug" }, channels: [], created_at: NaN
  };
  return (
    <div
      className="ticker-list"
      onClick={props.toggle("tickerListOpen")} >
      <div className="first-ticker">
        {Ticker(firstTicker || noLogs, -1)}
      </div>
        <Collapse isOpen={props.tickerListOpen}>
          {props
            .logs
            .filter((log, index) => index !== 0)
            .map((log: Log, index: number) => {
              const isFiltered = log.message.toLowerCase().includes("filtered");
              if (!isFiltered) { return Ticker(log, index); }
            })}
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
  );
};
