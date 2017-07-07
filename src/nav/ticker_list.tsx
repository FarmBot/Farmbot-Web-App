import * as React from "react";
import { Markdown } from "../ui/index";
import * as moment from "moment";
import { Log } from "../interfaces";

export let TickerList = (props: { logs: Log[] }) => {
  return <div className="ticker-list">
    {props.logs.map((log: Log) => {
      let isFiltered = log.message.toLowerCase().includes("filtered");
      let time = moment.unix(log.created_at).local().format("h:mm a");
      if (!isFiltered) {
        return <div key={log.id} className="status-ticker-wrapper">
          <div className={`saucer ${log.meta.type}`} />
          <label className="status-ticker-message">
            <Markdown>
              {log.message || "Loading"}
            </Markdown>
          </label>
          <label className="status-ticker-created-at">
            {time}
          </label>
        </div>;
      }
    })}
  </div>;
};
