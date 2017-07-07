import * as React from "react";
import * as moment from "moment";
import { Collapse } from "@blueprintjs/core";

import { Markdown } from "../ui/index";
import { Log } from "../interfaces";
import { TickerListProps } from "./interfaces";

let Ticker = (log: Log, index: number) => {
  let time = moment.unix(log.created_at).local().format("MMM D, h:mma");
  let type = (log.meta || {}).type;
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
  let firstTicker: Log = props.logs[0];
  return (
    <div
      className="ticker-list"
      onClick={props.toggle("tickerListOpen")}
    >
      <div className="first-ticker">
        {Ticker(firstTicker || { type: "" }, -1)}
      </div>
      <Collapse isOpen={props.tickerListOpen}>
        {props
          .logs
          .filter((log, index) => index !== 0)
          .map((log: Log, index: number) => {
            let isFiltered = log.message.toLowerCase().includes("filtered");
            if (!isFiltered) { return Ticker(log, index); }
          })}
      </Collapse>
    </div>
  );
};
