import * as React from "react";
import * as moment from "moment";
import { Collapse } from "@blueprintjs/core";

import { Markdown } from "../ui/index";
import { Log } from "../interfaces";
import { TickerListProps } from "./interfaces";

const Ticker = (log: Log, index: number) => {
  const time = moment.unix(log.created_at).local().format("MMM D, h:mma");
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
    message: "No logs yet.", meta: { type: "success" }, channels: [], created_at: NaN
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
    </div>
  );
};
