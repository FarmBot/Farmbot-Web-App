import * as React from "react";
import { Markdown } from "./ui/index";
import * as moment from "moment";

export function TickerList(props: any) {
  <div className="ticker-list">
    {props.logs.map((log, index) => {
      let isFiltered = log.message.toLowerCase().includes("filtered");
      let time = moment.unix(log.created_at).local().format("h:mm a");
      if (!isFiltered) {
        return <div key={index} className="status-ticker-wrapper">
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
}
